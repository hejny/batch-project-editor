import chalk from 'chalk';
import { readFile } from 'fs/promises';
import { join } from 'path';
import spaceTrim from 'spacetrim';
import { forTime } from 'waitasecond';
import { IWorkflowOptions, WorkflowResult } from '../IWorkflow';
import { IMAGINE_VERSION } from './config';
import { getDiscordPage, prepareDiscordPage } from './utils/discordPage';
import { DISCORD_MESSAGE_QUERYSELECTOR } from './utils/discordQuerySelectors';
import { searchMidjourney } from './utils/searchMidjourney/searchMidjourney';
import { stripFlagsFromPrompt } from './utils/stripFlagsFromPrompt';

export async function aiGeneratedWallpaperLand({
    skippingBecauseOf,
    projectPath,
}: IWorkflowOptions): Promise<WorkflowResult> {
    // TODO: [🏯] Dry to some util
    const wallpaperPath = join(projectPath, '/assets/ai/wallpaper/');
    const wallpaperImaginePath = join(wallpaperPath, 'imagine');
    const wallpaperImagineContents = await readFile(wallpaperImaginePath, 'utf8');
    const imagines = spaceTrim(wallpaperImagineContents)
        .split('\n\n')
        .map((row) => row.split('\n').join(' ').split('  ').join(' ').trim())
        .filter((row) => row !== '' && !row.startsWith('#'));

    for (const imagine of imagines) {
        // Note: Test if already landed
        const searchResult = await searchMidjourney({
            prompt: stripFlagsFromPrompt(imagine),
            version: IMAGINE_VERSION,
            isRetrying: false,
        }).catch((error) => {
            // TODO: !!! What is the best strategy here?
            console.error(chalk.gray(error));
            return [];
        });
        if (searchResult.length > 0) {
            return skippingBecauseOf(`already landed "${stripFlagsFromPrompt(imagine)}"`);
        }

        const discordPage = getDiscordPage();

        console.log(chalk.blue(imagine));

        await discordPage.type(DISCORD_MESSAGE_QUERYSELECTOR, '/imagine ' + imagine, { delay: 50 });
        await discordPage.keyboard.press('Enter');

        // TODO: [🏯] Configurable waiting time> await forTime(1000 * 60 * Math.random());
        let secondsToWait = 60 * 10 * Math.random();
        console.info(chalk.gray(`⏳ Waiting for ${secondsToWait} seconds after writing /imagine command`));
        await forTime(1000 * secondsToWait);
    }

    return WorkflowResult.SideEffect;
}

aiGeneratedWallpaperLand.initialize = prepareDiscordPage;

/**
 * TODO: !!! Re-land if landed loot of time ago with no upscale
 * TODO: Maybe rename to aiGeneratedWallpaperImagine
 * [🏯] ??? DigitalOcean Referral Badge
 * TODO: LIB spacetrim should be able to modify prototype of string and add there a .spaceTrim() method
 */
