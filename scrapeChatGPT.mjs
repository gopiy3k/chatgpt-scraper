import puppeteer from 'puppeteer-extra';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';
import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

puppeteer.use(StealthPlugin());
dotenv.config();

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const promptToAsk = "What is Generative Engine Optimization?";
const sessionToken = process.env.CHATGPT_SESSION;

async function waitForResponseCompletion(page) {
    console.log('⏳ Waiting for response to stabilize...');
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
            console.log("⚠️ Error while waiting:", error.message);
            break;
        }
    }

    return lastResponseText;
}

(async () => {
    if (!sessionToken || !promptToAsk) {
        throw new Error('❌ CHATGPT_SESSION and PROMPT_TO_ASK must be set.');
    }

    console.log('🚀 Launching stealth browser...');
    let browser;
    try {
        browser = await puppeteer.launch({
            headless: 'new',
            args: [
                '--no-sandbox',
                '--disable-setuid-sandbox',
                '--disable-dev-shm-usage',
                '--disable-gpu',
                '--disable-accelerated-2d-canvas',
                '--no-zygote',
                '--single-process',
            ],
        });

        const page = await browser.newPage();

        console.log('🍪 Injecting session token...');
        await page.setCookie({
            name: '__Secure-next-auth.session-token',
            value: sessionToken,
            domain: '.chat.openai.com',
            path: '/',
            httpOnly: true,
            secure: true,
            sameSite: 'Lax'
        });

        console.log('🌍 Navigating to ChatGPT...');
        await page.goto('https://chat.openai.com/', { waitUntil: 'domcontentloaded' });

        console.log('✅ Logged in and page loaded.');

        let found = false;
        for (let attempt = 0; attempt < 2; attempt++) {
            try {
                await page.waitForSelector('textarea', { visible: true, timeout: 30000 });
                found = true;
                break;
            } catch {
                console.log(`Attempt ${attempt + 1} failed. Retrying...`);
                await page.reload({ waitUntil: 'domcontentloaded' });
            }
        }

        if (!found) throw new Error("Prompt textarea never appeared.");

        console.log('⌨️ Typing prompt...');
        await page.type('textarea', promptToAsk, { delay: 50 });
        console.log('⏎ Submitting prompt...');
        await page.keyboard.press('Enter');

        const response = await waitForResponseCompletion(page);

        console.log('\n✅ Final Response:\n', response);

     // Define your prompt and brand
const brandName = "LexiRank"; // or fetch dynamically
const aiEngine = "chatgpt";

// Check if brand is mentioned (simple check)
const appears = response.toLowerCase().includes(brandName.toLowerCase());

// Insert into visibility_results
const { data, error } = await supabase.from('visibility_results').insert({
  prompt: promptToAsk,
  ai_engine: aiEngine,
  brand: brandName,
  appears: appears,
  position: null, // placeholder, or extract if needed
  raw_response: response
});


        if (error) {
            console.error('❌ Failed to insert into Supabase:', error.message);
        } else {
            console.log('📊 Stored result in visibility_results:', data);
        }

    } catch (err) {
        console.error('❌ Error during scraping:', err);
    } finally {
        if (browser) {
            console.log('🔒 Closing browser...');
            await browser.close();
        }
    }
})();
