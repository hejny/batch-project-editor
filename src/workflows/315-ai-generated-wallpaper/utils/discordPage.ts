import chalk from 'chalk';
import { locateChrome } from 'locate-app';
import { join } from 'path';
import puppeteer from 'puppeteer-core';
import { DISCORD_MESSAGE_QUERYSELECTOR } from './discordQuerySelectors';

/**
 * @private
 */
let discordPage: puppeteer.Page | null = null;

export function getDiscordPage(): puppeteer.Page {
    if (!discordPage) {
        throw new Error(`Discord page not initialized`);
    }
    return discordPage;
}

export async function prepareDiscordPage() {
    if (discordPage) {
        return;
    }

    /*
    TODO: [0] Maybe implement connecting to existing browser instance
    const browser = await puppeteer.connect({
        browserWSEndpoint: `ws://127.0.0.1:4779/devtools/browser/f4e44058-c97b-4f24-95af-31822ae0b04b`,
        defaultViewport: null,
    });
    */

    const browser = await puppeteer.launch({
        // TODO: [0]
        executablePath: await locateChrome(),
        headless: false,
        defaultViewport: null,
        userDataDir: join(process.cwd(), '.tmp', 'puppeteer', 'ai-user-data'),
        // TODO: Do not show "Restore" dialog
    });

    discordPage = await browser.newPage();
    await discordPage.goto(`https://discord.com/channels/@me/994943513500336138`);

    console.info(chalk.bgYellow(` 🚀  Please log in into Discord and then go to PM with MidJourney Bot `));

    await discordPage.waitForSelector(DISCORD_MESSAGE_QUERYSELECTOR, { timeout: 1000 * 60 * 15 /* minutes */ });
}


/**
 * TODO: [🏏] Common stuff for discordPage and githubPage
 */