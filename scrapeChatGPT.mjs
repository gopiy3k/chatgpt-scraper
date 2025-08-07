import puppeteer from 'puppeteer-extra';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';
import dotenv from 'dotenv';
import fs from 'fs';

puppeteer.use(StealthPlugin());

dotenv.config();
const promptToAsk = 'What is Generative Engine Optimization?';

// --- NEW: A robust function to wait for the response to stop changing ---
async function waitForResponseCompletion(page) {
    console.log('Waiting for response to stabilize...');
    let lastResponseText = '';
    let stableCount = 0;
    const requiredStableCount = 3; // Must be stable for 3 checks (3 seconds)

    while (stableCount < requiredStableCount) {
        const currentResponseText = await page.evaluate(() => {
            const allMessages = Array.from(document.querySelectorAll('div[data-message-author-role="assistant"]'));
            if (!allMessages.length) return '';
            const lastMessage = allMessages[allMessages.length - 1];
            return lastMessage.querySelector('.markdown')?.innerText || '';
        });

        if (currentResponseText === lastResponseText && currentResponseText !== '') {
            stableCount++;
        } else {
            stableCount = 0;
        }
        
        lastResponseText = currentResponseText;
        if (stableCount < requiredStableCount) {
             await new Promise(r => setTimeout(r, 1000)); // Wait 1 second between checks
        }
    }
    return lastResponseText;
}


(async () => {
    console.log('🚀 Launching stealth browser...');
    const browser = await puppeteer.launch({
        headless: false,
        args: ['--start-maximized'],
    });

    const page = await browser.newPage();
    
    console.log('🌍 Navigating to ChatGPT...');
    await page.goto('https://chat.openai.com/', { waitUntil: 'domcontentloaded' });

    console.log('✅ Page navigated.');

    try {
        const promptTextareaSelector = '#prompt-textarea';
        await page.waitForSelector(promptTextareaSelector, { visible: true, timeout: 60000 });
        
        console.log('Typing prompt...');
        await page.type(promptTextareaSelector, promptToAsk, { delay: 50 });

        const sendButtonSelector = 'button[data-testid="send-button"]';
        await page.waitForSelector(sendButtonSelector, { visible: true });
        await page.click(sendButtonSelector);
        console.log('⏳ Prompt submitted. Waiting for response...');

        // --- Use our new robust waiting function ---
        const response = await waitForResponseCompletion(page);
        
        console.log('✅ Response finished generating.');
        
        console.log('\n📥 Response:\n', response);
        fs.writeFileSync('response.txt', response);
        console.log('✅ Saved to response.txt');

    } catch (err) {
        console.error('❌ Error during scraping:', err);
        await page.screenshot({ path: 'error_screenshot.png' });
        console.log('📸 Screenshot saved to error_screenshot.png');
    } finally {
        console.log('Closing browser...');
        await browser.close();
    }
})();