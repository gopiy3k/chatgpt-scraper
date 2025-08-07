import puppeteer from 'puppeteer-extra';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';
import dotenv from 'dotenv';
import fs from 'fs';

// This is the same
puppeteer.use(StealthPlugin());

dotenv.config();
const promptToAsk = process.env.PROMPT_TO_ASK;

async function waitForResponseCompletion(page) {
    console.log('Waiting for response to stabilize...');
    let lastResponseText = '';
    let stableCount = 0;
    const requiredStableCount = 3;

    while (stableCount < requiredStableCount) {
        try {
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
                 await new Promise(r => setTimeout(r, 1000));
            }
        } catch (error) {
            console.log("Error during response check, likely page closed. Exiting wait.", error.message);
            break; // Exit loop if page context is lost
        }
    }
    return lastResponseText;
}


(async () => {
    console.log('🚀 Launching stealth browser...');
    let browser;
    try {
        // --- FINAL FIX: Add more stability arguments ---
        browser = await puppeteer.launch({
            headless: 'new',
            executablePath: process.env.PUPPETEER_EXECUTABLE_PATH,
            args: [
                '--no-sandbox',
                '--disable-setuid-sandbox',
                '--disable-dev-shm-usage',
                '--disable-accelerated-2d-canvas',
                '--no-first-run',
                '--no-zygote',
                '--disable-gpu' // This is a key flag for stability in server environments
            ],
        });

        const page = await browser.newPage();
        
        console.log('🌍 Navigating to ChatGPT...');
        await page.goto('https://chat.openai.com/', { waitUntil: 'domcontentloaded' });

        console.log('✅ Page navigated.');

        const promptTextareaSelector = '#prompt-textarea';
        await page.waitForSelector(promptTextareaSelector, { visible: true, timeout: 60000 });
        
        console.log('Typing prompt...');
        await page.type(promptTextareaSelector, promptToAsk, { delay: 50 });

        const sendButtonSelector = 'button[data-testid="send-button"]';
        await page.waitForSelector(sendButtonSelector, { visible: true });
        await page.click(sendButtonSelector);
        console.log('⏳ Prompt submitted. Waiting for response...');

        const response = await waitForResponseCompletion(page);
        
        console.log('✅ Response finished generating.');
        
        console.log('\n📥 Response:\n', response);
        // On a server, you might write to a database instead of a file
        // For now, we can log it. Render's filesystem is ephemeral.
        // fs.writeFileSync('response.txt', response); 
        // console.log('✅ Saved to response.txt');

    } catch (err) {
        console.error('❌ Error during scraping:', err);
    } finally {
        if (browser) {
            console.log('Closing browser...');
            await browser.close();
        }
    }
})();