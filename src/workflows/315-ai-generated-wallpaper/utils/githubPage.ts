import chalk from 'chalk';
import { locateChrome } from 'locate-app';
import { join } from 'path';
import puppeteer from 'puppeteer-core';

/**
 * @private
 */
let githubPage: puppeteer.Page | null = null;

export function getGithubPage(): puppeteer.Page {
    if (!githubPage) {
        throw new Error(`Github page not initialized`);
    }
    return githubPage;
}

export async function prepareGithubPage() {
    if (githubPage) {
        return;
    }

    const browser = await puppeteer.launch({
        // TODO: [0]
        executablePath: await locateChrome(),
        headless: false,
        defaultViewport: null,
        userDataDir: join(process.cwd(), '.tmp', 'puppeteer', 'ai-user-data'),
        // TODO: Do not show "Restore" dialog
    });

    githubPage = await browser.newPage();
    await githubPage.goto(`https://github.com/hejny/hejny/settings`);

    console.info(chalk.bgYellow(` 🚀  Please log in into Github (if not already logged) `));

    await githubPage.waitForSelector(`div[id="options_bucket"]`, { timeout: 1000 * 60 * 15 /* minutes */ });
}

/**
 * TODO: [🏏] Common stuff for githubPage and githubPage
 */
