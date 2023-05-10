import chalk from 'chalk';
import { readFile } from 'fs/promises';
import { join } from 'path';
import spaceTrim from 'spacetrim';
import { forTime } from 'waitasecond';
import { WAIT_MULTIPLICATOR } from '../../config';
import { forPlay } from '../../utils/forPlay';
import { IWorkflowOptions, WorkflowResult } from '../IWorkflow';
import { IMAGINE_VERSION } from './config';
import { getDiscordPage, prepareDiscordPage } from './utils/discordPage';
import { DISCORD_MESSAGE_QUERYSELECTOR } from './utils/discordQuerySelectors';
import { searchFromDownloaded } from './utils/searchMidjourney/searchMidjourney';
import { stripFlagsFromPrompt } from './utils/stripFlagsFromPrompt';
import { triggerMidjourney } from './utils/trigger/triggerMidjourney';

export async function aiGeneratedWallpaperLand({
    skippingBecauseOf,
    projectPath,
    madeSideEffect,
}: IWorkflowOptions): Promise<WorkflowResult> {
    // TODO: [🏯] Dry to some util - Use WALLPAPER_PATH + WALLPAPER_IMAGINE_PATH
    const wallpaperPath = join(projectPath, '/assets/ai/wallpaper/');
    const wallpaperGalleryPath = join(wallpaperPath, 'gallery');
    const wallpaperImaginePath = join(wallpaperPath, 'imagine');
    const wallpaperImagineContents = await readFile(
        wallpaperImaginePath,
        'utf8',
    ); /* <- TODO: !! Use here propper util from BPE workflow NOT raw absolute-path readFile */
    const imagines = spaceTrim(wallpaperImagineContents)
        .split('\r\n')
        .join('\n')
        .split('\n\n')
        .map((row) => row.split('\n').join(' ').split('  ').join(' ').trim())
        .filter((row) => row !== '' && !row.startsWith('#'));

    let landedCount = 0;

    // TODO: Remove all console.log
    console.log({ wallpaperImagineContents, imagines });

    for (const imagine of imagines) {
        await forPlay();

        //-------------
        // Note: Test if already landed
        const searchResult = await searchFromDownloaded({
            prompt: stripFlagsFromPrompt(imagine),
            version: IMAGINE_VERSION,
            isRetrying: false,
        }).catch((error) => {
            // TODO: !! What is the best strategy here?
            console.error(chalk.gray(error));
            return [];
        });
        if (searchResult.length > 0) {
            continue;
        }

        //-------------

        //-------------
        /*/
        // Note: Test if already harvested
        // TODO: !! Temporary solution - skipping all harvested
        const allWallpapersPaths = await glob(join(wallpaperGalleryPath, '*.png'));
        console.log({ allWallpapersPaths });
        if (allWallpapersPaths.length !== 0) {
            continue;
        }
        /**/
        //-------------

        const discordPage = getDiscordPage();

        console.log(chalk.magenta('/imagine ') + chalk.blue(imagine));

        await forPlay();
        await discordPage.type(DISCORD_MESSAGE_QUERYSELECTOR, '/imagine ' + imagine, { delay: 50 });
        await discordPage.keyboard.press('Enter');

        landedCount++;

        await forPlay();

        // TODO: [🏯] Configurable waiting time> await forTime(1000 * 60 * Math.random());
        let secondsToWaitAfterImagine = 60 * 7 * Math.random() * WAIT_MULTIPLICATOR;
        console.info(chalk.gray(`⏳ Waiting for ${secondsToWaitAfterImagine} seconds after writing /imagine command`));
        await forTime(1000 * secondsToWaitAfterImagine);
        await forPlay();

        /**/
        const { triggeredCount } = await triggerMidjourney({ discordPage, triggerMaxCount: 4, scrollMaxPagesCount: 1 });
        console.info(chalk.green(`⏫ Upscaled ${triggeredCount} images`));

        // TODO: [🏯] Configurable waiting time
        let secondsToWaitAfterUpscale = 60 * 2 * Math.random() * WAIT_MULTIPLICATOR;
        console.info(chalk.gray(`⏳ Waiting for ${secondsToWaitAfterUpscale} seconds after clicking on upscale`));
        await forTime(1000 * secondsToWaitAfterUpscale);
        await forPlay();
        /**/
    }

    if (landedCount === 0) {
        // TODO: [🥗] There should be 2 different returns: skippingBecauseOf VS notingChangedBecauseOf
        return skippingBecauseOf(`All imagine commands already landed`);
    } else {
        return madeSideEffect(`Written imagine command to MidJourney discord`);
    }
}

aiGeneratedWallpaperLand.initialize = prepareDiscordPage;

/**
 * TODO: Why there is duplicite flags
 *     > Background patterns for virtual online whiteboard --version 4 --aspect 3:2 --v 4 --q 2
 * TODO: !! Re-land if landed loot of time ago with no upscale
 * TODO: Maybe rename to aiGeneratedWallpaperImagine
 * [🏯] ??? DigitalOcean Referral Badge
 * TODO: LIB spacetrim should be able to modify prototype of string and add there a .spaceTrim() method
 */
