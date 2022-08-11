import chalk from 'chalk';
import { locateChrome } from 'locate-app';
import { join } from 'path';
import puppeteer from 'puppeteer-core';

export const DISCORD_MESSAGE_QUERYSELECTOR = `div[role='textbox']`;

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

    const browser = await puppeteer.launch({
        executablePath: await locateChrome(),
        headless: false,
        defaultViewport: null,
        userDataDir: join(process.cwd(), '.tmp', 'puppeteer', 'ai-user-data'),
        /*
      args: [
          '--user-data-dir=C:\\Users\\me\\AppData\\Local\\Google\\Chrome\\User Data',
          '--profile-directory=Default',
      ],
      */
    });

    discordPage = await browser.newPage();
    await discordPage.goto(`https://discord.com/channels/@me/994943513500336138`);

    console.info(chalk.bgYellow(` 🚀  Please log in into Discord and then go to PM with MidJourney Bot `));

    await discordPage.waitForSelector(DISCORD_MESSAGE_QUERYSELECTOR, { timeout: 1000 * 60 * 15 /* minutes */ });
}
