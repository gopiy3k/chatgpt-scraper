import puppeteer from 'puppeteer-extra';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';
import dotenv from 'dotenv';
import fs from 'fs';

puppeteer.use(StealthPlugin());
dotenv.config();

const promptToAsk = process.env.PROMPT_TO_ASK;
const sessionToken = process.env.CHATGPT_SESSION;

// (The waitForResponseCompletion function remains the same)
// ...

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
            // ... (rest of cookie properties)
        });
        
        console.log('🌍 Navigating to ChatGPT...');
        await page.goto('https://chat.openai.com/', { waitUntil: 'domcontentloaded' });

        console.log('✅ Page navigated and logged in via session token.');

        // --- FINAL DIAGNOSTIC STEP: TAKE A SCREENSHOT ---
        console.log('📸 Taking a screenshot before waiting for the selector...');
        await page.screenshot({ path: 'debug_screenshot.png' });
        console.log('✅ Screenshot saved to debug_screenshot.png on the server.');
        // --- END OF DIAGNOSTIC STEP ---

        const promptTextareaSelector = 'textarea[data-testid="prompt-textarea"]';
        await page.waitForSelector(promptTextareaSelector, { visible: true, timeout: 60000 });
        
        // ... (The rest of your script) ...

    } catch (err) {
        console.error('❌ Error during scraping:', err);
    } finally {
        if (browser) {
            console.log('Closing browser...');
            await browser.close();
        }
    }
})();