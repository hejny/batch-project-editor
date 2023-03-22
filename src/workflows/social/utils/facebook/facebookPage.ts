import chalk from 'chalk';
import { locateChrome } from 'locate-app';
import { join } from 'path';
import puppeteer from 'puppeteer-core';
import { chromePageContainer } from '../../../page';

export async function getAdditionalFacebookPage(): Promise<puppeteer.Page> {
    if (!chromePageContainer.browser) {
        throw new Error(
            `Facebook page not initialized\n In workflow you are using the page you need to add initialize.`,
        );
    }

    return await chromePageContainer.browser.newPage();
}

export function getFacebookPage(): puppeteer.Page {
    if (!chromePageContainer.page) {
        throw new Error(`Facebook page not initialized`);
    }
    return chromePageContainer.page;
}

export async function prepareFacebookPage() {
    if (chromePageContainer.page) {
        return;
    }

    /*
    TODO: [0] Maybe implement connecting to existing browser instance
    const browser = await puppeteer.connect({
        browserWSEndpoint: `ws://127.0.0.1:4779/devtools/browser/f4e44058-c97b-4f24-95af-31822ae0b04b`,
        defaultViewport: null,
    });
    */

    // TODO: Use here puppeteer-cluster to be able to run multiple browser-based workflows at once
    const browser = await puppeteer.launch({
        // TODO: [0]
        executablePath: await locateChrome(),
        headless: false,
        defaultViewport: null,
        userDataDir: join(process.cwd(), '.tmp', 'puppeteer', 'ai-user-data'),
        // TODO: Do not show "Restore" dialog
    });

    chromePageContainer.browser = browser;
    chromePageContainer.page = await browser.newPage();
    await chromePageContainer.page.goto(`https://www.facebook.com/`);

    console.info(
        chalk.bgYellow(
            ` 🚀  Please log in into Discord (if not already logged) and then go to PM with MidJourney Bot `,
        ),
    );

    /*
    TODO: Wait for FB ready
    await pageContainer.page.waitForSelector(
        `.share-box-feed-entry__closed-share-box` /* <- TODO: !!! Unhardcode to config * /,
        {
            timeout: 1000 * 60 * 15 /* minutes * /,
        },
    );
    */
}

/**
 * TODO: [🏏] Common stuff for facebookPage and githubPage
 */
