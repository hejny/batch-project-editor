import chalk from 'chalk';
import { locateChrome } from 'locate-app';
import { join } from 'path';
import puppeteer from 'puppeteer-core';
import { pageContainer } from '../../../page';

export function getLinkedinPage(): puppeteer.Page {
    if (!pageContainer.page) {
        throw new Error(`Discord page not initialized`);
    }
    return pageContainer.page;
}

export async function prepareLinkedinPage() {
    if (pageContainer.page) {
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

    pageContainer.page = await browser.newPage();
    await pageContainer.page.goto(`https://www.linkedin.com/feed/` /* <- TODO: Unhardcode */);

    console.info(
        chalk.bgYellow(
            ` 🚀  Please log in into Discord (if not already logged) and then go to PM with MidJourney Bot `,
        ),
    );

    await pageContainer.page.waitForSelector(
        `.share-box-feed-entry__closed-share-box` /* <- !!! Unhardcode to config */,
        {
            timeout: 1000 * 60 * 15 /* minutes */,
        },
    );
}

/**
 * TODO: [🏏] Common stuff for linkedinPage and githubPage
 */
