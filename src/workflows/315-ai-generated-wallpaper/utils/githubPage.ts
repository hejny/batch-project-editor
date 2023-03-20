import chalk from 'chalk';
import { locateChrome } from 'locate-app';
import { join } from 'path';
import puppeteer from 'puppeteer-core';
import { chromePageContainer } from '../../page';

export function getGithubPage(): puppeteer.Page {
    if (!chromePageContainer.page) {
        throw new Error(`Github page not initialized`);
    }
    return chromePageContainer.page;
}

export async function prepareGithubPage() {
    if (chromePageContainer.page) {
        return;
    }

    // TODO: Use here puppeteer-cluster to be able to run multiple browser-based workflows at once
    const browser = await puppeteer.launch({
        // TODO: [0]
        executablePath: await locateChrome(),
        headless: false,
        defaultViewport: null,
        userDataDir: join(process.cwd(), '.tmp', 'puppeteer', 'ai-user-data'),
        // TODO: Do not show "Restore" dialog
    });

    chromePageContainer.page = await browser.newPage();
    await chromePageContainer.page.goto(`https://github.com/hejny/hejny/settings`);

    console.info(chalk.bgYellow(` 🚀  Please log in into Github (if not already logged) `));

    await chromePageContainer.page.waitForSelector(`div[id="options_bucket"]`, {
        timeout: 1000 * 60 * 15 /* minutes */,
    });
}

/**
 * TODO: [🏏] Common stuff for githubPage and githubPage
 */
