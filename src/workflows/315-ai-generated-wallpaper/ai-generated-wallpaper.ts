import chalk from 'chalk';
import { locateChrome } from 'locate-app';
import puppeteer from 'puppeteer-core';
import { forTime } from 'waitasecond';
import { IWorkflowOptions } from '../IWorkflow';

const DISCORD_MESSAGE_QUERYSELECTOR = `div[role='textbox']`;
let page: puppeteer.Page | null = null;

export async function aiGeneratedWallpaper({ packageJson }: IWorkflowOptions): Promise<void> {
    if (!page) {
        const browser = await puppeteer.launch({
            executablePath: await locateChrome(),
            headless: false,
            defaultViewport: null,

            /*
            args: [
                '--user-data-dir=C:\\Users\\me\\AppData\\Local\\Google\\Chrome\\User Data',
                '--profile-directory=Default',
            ],
            */
        });

        page = await browser.newPage();
        await page.goto(`https://discord.com/channels/@me/994943513500336138`);

        await page.waitForSelector(DISCORD_MESSAGE_QUERYSELECTOR);

        await forTime(1000 * 15);
    }

    await page.goto(`https://discord.com/channels/@me/994943513500336138`, {
        waitUntil: 'networkidle2',
    });

    // TODO: Maybe> await setDiscordCookies(...)

    // TODO: !!! Also PDF reports await page.pdf({path: 'hn.pdf', format: 'a4'});

    // TODO: Maybe some prefixes like "wallpaper for project..."
    const midjourneyCommand = `/imagine ${packageJson.description} --w 1280 --h 640`;
    console.log(chalk.blue(midjourneyCommand));
    // !!! Remove> await page.click(DISCORD_MESSAGE_QUERYSELECTOR);
    await page.type(DISCORD_MESSAGE_QUERYSELECTOR, midjourneyCommand, { delay: 50 });
    await page.keyboard.press('Enter');

    // !!! Remove> await forTime(1000 * 20);
    // !!! Remove> (await page.$(DISCORD_MESSAGE_QUERYSELECTOR))?.type(midjourneyCommand);

    // !!! Remove> console.log((await page.$(DISCORD_MESSAGE_QUERYSELECTOR))?.asElement());

    // !!! Solve this big delay better
    console.log(chalk.gray(`Waiting for 2 minutes...`));
    await forTime(1000 * 60 * 2);

    //await browser.close();
}
