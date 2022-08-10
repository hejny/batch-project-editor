import chalk from 'chalk';
import { readFile } from 'fs/promises';
import { locateChrome } from 'locate-app';
import { join } from 'path';
import puppeteer from 'puppeteer-core';
import spaceTrim from 'spacetrim';
import { forTime } from 'waitasecond';
import { IWorkflowOptions, WorkflowResult } from '../IWorkflow';
import { searchMidjourney } from './utils/searchMidjourney/searchMidjourney';

const DISCORD_MESSAGE_QUERYSELECTOR = `div[role='textbox']`;
let page: puppeteer.Page | null = null;

export async function aiGeneratedWallpaperLand({
    skippingBecauseOf,
    projectPath,
    packageJson,
}: IWorkflowOptions): Promise<WorkflowResult> {
    // !!! Dry to some util
    const wallpaperPath = join(projectPath, '/assets/ai/wallpaper/');
    const wallpaperImaginePath = join(wallpaperPath, 'imagine');
    const wallpaperImagineContents = await readFile(wallpaperImaginePath, 'utf8');
    const imagine = spaceTrim(wallpaperImagineContents).split('\n\n')[0].split('\n').join(' ').split('  ').join(' ');
    const imagineSentence = imagine
        .split(/--[a-zA-Z]+\s+[^\s]+\s*/g)
        .join()
        .trim();

    // Note: Test if already landed
    const searchResult = await searchMidjourney({ prompt: imagineSentence });
    if (searchResult.length > 0) {
        return skippingBecauseOf(`Already landed`);
    }

    if (!page) {
        throw new Error(`aiGeneratedWallpaperLand not initialized`);
    }

    /*
    await page.goto(`https://discord.com/channels/@me/994943513500336138`, {
        waitUntil: 'networkidle2',
    });

    */

    // TODO: Maybe> await setDiscordCookies(...)

    // TODO: !!! Also PDF reports await page.pdf({path: 'hn.pdf', format: 'a4'});

    // TODO: Maybe some prefixes like "wallpaper for project..."

    console.log(chalk.blue(imagine));
    await page.type(DISCORD_MESSAGE_QUERYSELECTOR, '/imagine ' + imagine, { delay: 50 });
    await page.keyboard.press('Enter');

    await forTime(1000 * 60 * Math.random());

    //await browser.close();

    return WorkflowResult.SideEffect;
}

aiGeneratedWallpaperLand.initialize = async function () {

    // !!! Save session https://stackoverflow.com/questions/48608971/how-to-manage-log-in-session-through-headless-chrome

    
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

    console.info(chalk.bgYellow(` 🚀  Please log in into Discord and then go to PM with MidJourney Bot `));

    await page.waitForSelector(DISCORD_MESSAGE_QUERYSELECTOR);
};
