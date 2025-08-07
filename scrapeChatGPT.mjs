import puppeteer from 'puppeteer-extra';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';
import dotenv from 'dotenv';
import fs from 'fs';

puppeteer.use(StealthPlugin());
dotenv.config();

// Read both the prompt AND the session token from the .env file
const promptToAsk = process.env.PROMPT_TO_ASK;
const sessionToken = process.env.CHATGPT_SESSION;

// A robust function to wait for the response to stop changing
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
    if (!sessionToken || !promptToAsk) {
        throw new Error('CHATGPT_SESSION and PROMPT_TO_ASK must be set in your environment variables.');
    }

    console.log('🚀 Launching stealth browser...');
    let browser;
    try {
        browser = await puppeteer.launch({
            headless: 'new',
            executablePath: process.env.PUPPETEER_EXECUTABLE_PATH,
            args: [
                '--no-sandbox',
                '--disable-setuid-sandbox',
                '--disable-dev-shm-usage',
                '--disable-gpu'
            ],
        });

        const page = await browser.newPage();
        
        console.log('Injecting session token...');
        await page.setCookie({
            name: '__Secure-next-auth.session-token',
            value: sessionToken,
            domain: '.chatgpt.com',
            path: '/',
            httpOnly: true,
            secure: true,
            sameSite: 'Lax'
        });
        
        console.log('🌍 Navigating to ChatGPT...');
        await page.goto('https://chat.openai.com/', { waitUntil: 'domcontentloaded' });

        console.log('✅ Page navigated and logged in via session token.');

        // Use the selector for the logged-in view
        const promptTextareaSelector = 'textarea[data-testid="prompt-textarea"]';
        await page.waitForSelector(promptTextareaSelector, { visible: true, timeout: 60000 });
        
        console.log('Typing prompt...');
        await page.type(promptTextareaSelector, promptToAsk, { delay: 50 });

        console.log('Submitting prompt by pressing Enter...');
        await page.keyboard.press('Enter');
        console.log('⏳ Prompt submitted. Waiting for response...');

        const response = await waitForResponseCompletion(page);
        
        console.log('✅ Response finished generating.');
        console.log('\n📥 Response:\n', response);

    } catch (err) {
        console.error('❌ Error during scraping:', err);
    } finally {
        if (browser) {
            console.log('Closing browser...');
            await browser.close();
        }
    }
})();