import chalk from 'chalk';
import { locateChrome } from 'locate-app';
import { join } from 'path';
import puppeteer from 'puppeteer-core';
import { chromePageContainer } from '../../page';
import { DISCORD_MESSAGE_QUERYSELECTOR } from './discordQuerySelectors';

export function getDiscordPage(): puppeteer.Page {
    if (!chromePageContainer.page) {
        throw new Error(
            `Discord page not initialized\n In workflow you are using the page you need to add initialize.`,
        );
    }
    return chromePageContainer.page;
}

export async function prepareDiscordPage() {
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

    chromePageContainer.page = await browser.newPage();
    await chromePageContainer.page.goto(
        `https://discord.com/channels/@me/994943513500336138` /* <- TODO: Unhardcode */,
    );

    console.info(
        chalk.bgYellow(
            ` 🚀  Please log in into Discord (if not already logged) and then go to PM with MidJourney Bot `,
        ),
    );

    await chromePageContainer.page.waitForSelector(DISCORD_MESSAGE_QUERYSELECTOR, {
        timeout: 1000 * 60 * 15 /* minutes */,
    });
}

/**
 * TODO: [🏏] Common stuff for discordPage, githubPage and chatBingPage
 */
