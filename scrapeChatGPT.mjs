import puppeteer from 'puppeteer-extra';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';
import dotenv from 'dotenv';
import fs from 'fs';

puppeteer.use(StealthPlugin());
dotenv.config();

const promptToAsk = "What is Generative Engine Optimization?";
// --- FINAL TEST: Paste your session token directly here ---
const sessionToken = "eyJhbGciOiJkaXIiLCJlbmMiOiJBMjU2R0NNIn0..GJYMIGVr-F3spgr-.GE43sZtgTr6Ty-swGQb9D0iKmbL4nXdnv9dthkhgdZxa1tPgOenVJH3xMEG7v2eVn9OU4Q6SUMOHtq3nPF6tu3PdIN-FzyBOVcC6mktWcISn2NXsEgRND3s1RaglqN1RpfujXx9C3fjimxUmkKN7kUA5f_u6myCT3d70U0_esG6wv4Y52AO0flLYJ6V1SKXiYf6yYk3Dl__vcQR2DJa5WaYHQFfcbh_fxRJToKripor1eQjCZHAglv7J1OyFh0v2rKqOru8kqv5tn57skCW8Vaah3vtPQnXtYhCtSirqOk-RFN80_faKfE6SwxNsTJR6i6q2DLKhHnSRJA6ygCwjD23MeTHBhh2Yqapsrcul3kpH3PXRDlf_p2tyFZmXl9abZbrDbw-2FrLE0xBx94ODdgDVNLl_xR0LtrxwnkonOUO-7wgiCDEjC6pxM1z17z9zaee66FuSFoMdZbn_YyOG1GXPxZMzm5DCGVxAaR62O44N1YyxhqHS-Kg7x3DDaWu4cMnmk8AvsfxHGGE8aIrlwFyUMOmzefMNJKSxfpi3_5tNlqVJE8sGk6B0t6frtQjylIPJKDszEBwdC_j5tAcZydJACljRO54RSAUzCo8MiI3w7qF41WHh-qxgiRQ9npBJq5-Oz3kmK_5p1ZZsmQY-T4mv7c0ysTPZ3PRRnPjqmY6ZYyrPxGSJudKstX97wst2zDSm5S9TOakYHMReTWkEVY0HyzJaz056pAFLbARWtVlaVl89FKEIeSbFot_JRKUGSda7Y2lz1NA2w52DFhqVz5rqDcA1pD3FSUW3ef1noFEqYe-xC8Jqcj4kr8Thj3B3fZJbZrpP99u1Jwzz8S52JIOtq8dpPpCKPR6bk3RqkCCWAtpk-W6Ujp5soh1enCAXrDXFZVKknBrD9UF_GWqG4WL-iAHNfezOvSpCRPFDIMXX5EA5r6A23MYk6algq_q_J12QIohpegwQfHbqt1rszUEOppX8NaZzCZXG9NUDx68-5MCDdL9SacrEpks6JDnBahyz2L0cV1yp49KQY3tceJpTOQMzgmKAQXI3s5UGMTqPpCeTB4N0Fo5N67HDXi4yL4oQkth8g7iIrk9mFenVpKmnH6WY1BeKLvbleDQhDtIXS8bs_LbSt0Y2f0FKqTmEF9X_MX9iNMv3CTmk58aIU0EmR87bo6L8WAeu0E59vdKEFnInMYO-7wnKjgY5cPRPtzF72dOjvQLIDGad2ZHCb4vHWNIMWESeXgKaBKtWoJ0bGs8RlKOTLYrw9QcPJJwDou4poWSn0wNkLFNC9_TzrucUMHN9t6IfB8GW5dwPwzLUdeH3fGh5jdko9aFPfzEY91A6CA0Oj2BhxPWCiMueezC1sCo2lbHHBYa7zzNn9bclVXqzR8pLEmRJ1NjEtQsEvu5k62DJ_OmVUzOQGlanQxSHGWLmW7z9zoc2VeolC5xXweia0IZ6bVm3P_jVThISmZ0lfe8od2Xr9iH-nGXka0veGXYTg277Azff_ZQLlsqT2YohP7q8405V324TgvyiUlcLLDxihPHuyZ66ARsoJwed3lieUWC4qqoLtlUitMFuSANwCzJ0-VHNedvLKrGLf5k_7matlJUx6oCX-y3wWYxxQirFDOswa0gz2QNlsNk4khUD5YesNGNfR7gInhfCz5D1opwfxlhBI2CPmFX48cFGvLXQ51-PkmjVax92eYzN7h3UzT3VfRxsDRcuLSJeALNmr7GwdsvIyeKOj1JKgaHkcnn-fpZf_XfeC0OzC2wX9egVUWvpU-9gXa8w2JTFFxQek_sb_6I8dMAZMM8ZdY3USo5ORN9KtLVTYc0JdKAY_E2Tn5O28HKBT2gbReaEWmgBfjOAhxWawjL1CCyo4daZkX_DOQuo9wt3Y0e-IQwanUrvDvy-0kca_9zaMEUFPYXp7L8bUZv06PTGLXsnJgDcoCD7jtV19fBglFsrgpA49515lvJ44xXvLHU-C-092AMvS2UbroG3C74M564dK0eVP4PezodII6bwD3pcKfVEJrsC7AeabQOIxmz1-7EsKO1ONKr55ui6QUPLPd9sYPMA5NdMDol_P0iopH18zOM9r4mY6onGucQ0NRbzxNbCCg7wSR3ZR6yldtYbKu7AtU3JZOUl4yNKf5IkSwKc8vi58il0ivtMkqmLOkHuTdR5ml8n26JlnYudlEp_UDaE5GxsDdjMBsTGITGGdCyS8KoimP39vZVPcGRQa-ROf_wt3lAHAgep1GmbYPhjBrBmRydFvJdi4izDYFFre38tF-i2tnOP0HwmpuQF7GRjX6G72-FEpmoOdIMBnbdtAlEG4q3T_FsOw9DGagG9njH34SrZmb8bNIE7bj5Q_0Fk64RAQopwF-J7wFpwQE_wzioVOO4m5YUcfDhaqh_Wvvccfm62_UIrvTiJr68VzzwJGn0JBs5882Q_-EtXNWlbbbl9HeeZXFss7QxtlOreLkBZVolITkSfrv1wBg8mI4nEiK3nUrs4ytvnyceh8F46v0tp4sISA5_Hnk2ZOg3lsK6njmQog5EkvygIDjBANFIihCKeJ7g3nDaMJSnwvxDHEQs7575XdfEUs7EDUnl-A3-n31f967PTeUGiUPRubZeJ-M0ksrpGSU_IaSa079SSdyGaZ-MvQ1DAsGTN3-Nr9iGTPN7uHAlpumgHAwEtRQyv30ixAzaM-jfrfXWInAjPCpcmHhhmsRbGSokxPz6dM0E3jvvBbBbanp09rZtNYdKf-qzrdNH_UosFVozrQeCqjQBzhQ0o4iOg2deyHtGRJ52ong31zp-pMDr_ZwwlqsJQ7V8fvktNNxnXywktCJYn7-GGilHuXMEl5qPejKlB5gS2eAljox3uHxws_qyr2a8cVZKMm1L4CA_XEeBjXx-YMhW0fQR0jI1eQ6jQym5bDQfpB9LhoweqX_lY2sr7Lforntv72vVmU-MhpeZ1mkgE46bwEcBU3OFt_Ud4ZfnsgSH9EC03LpyKkIcIV5eTZX8kG6XzxPB0HAe6rkkJWUPzk8IhFvrDmLM-rzk_GMevqsRWNv51PJCLZPebb8rVRu1aM4pR0Lfbs7zi7Kqid7RfBsUihTIHdcg4DsjyYLstJLTkece1lLL5aKcGDQitm9IGQSfs10StzDJhZSH8vd6cCCXupJF2JWjdv0rBZJfrTU3ONq0YxAYRgU6WTpbnCYjgjQHr6ir-LIdNvOsoycbQnj5GkxCTXnTQyDn6cs2Sa9rDbVaLZAz8ldgiLRuUhm4jvdq1i_9LEC319_-0f8f0c-Nj83IotG1LAYKvmGwXESAiQ0mJDzs0fW0iChul1q39fuyFtN-DUitewjuZvRR6UijTR9q2JEiAGyj44n3OfpilXPYNilWmdrsMHUIu2uiPCz7zt2nbLIHI-MI-yCN5bYzYPK-8XfAcHV5vsjBT1m5M603mypRAwRO_HlcYQilcacTBszUx3e4Lrk5J0lFyEodzQGY.sWdTjDwU3LUoSixzcYDf2A ";

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
            break;
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