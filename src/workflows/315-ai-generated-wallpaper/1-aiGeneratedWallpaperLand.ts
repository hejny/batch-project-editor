import chalk from 'chalk';
import { readFile } from 'fs/promises';
import { join } from 'path';
import spaceTrim from 'spacetrim';
import { forTime } from 'waitasecond';
import { IWorkflowOptions, WorkflowResult } from '../IWorkflow';
import { getDiscordPage, prepareDiscordPage } from './utils/discordPage';
import { DISCORD_MESSAGE_QUERYSELECTOR } from './utils/discordQuerySelectors';
import { searchMidjourney } from './utils/searchMidjourney/searchMidjourney';

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
        .filter((row) => row !== '' && !row.startsWith('#'))
        .map((imagineSentenceWithFlags) => ({
            imagineSentenceWithFlags,
            imagineSentence: imagineSentenceWithFlags
                .split(/--[a-zA-Z]+\s+[^\s]+\s*/g)
                .join('')
                .trim(),
        }));

    for (const { imagineSentence, imagineSentenceWithFlags } of imagines) {
        // Note: Test if already landed
        const searchResult = await searchMidjourney({ prompt: imagineSentence });
        if (searchResult.length > 0) {
            return skippingBecauseOf(`already landed "${imagineSentence}"`);
        }

        const discordPage = getDiscordPage();

        console.log(chalk.blue(imagineSentenceWithFlags));

        await discordPage.type(DISCORD_MESSAGE_QUERYSELECTOR, '/imagine ' + imagineSentenceWithFlags, { delay: 50 });
        await discordPage.keyboard.press('Enter');

        // TODO: [🏯] Configurable waiting time> await forTime(1000 * 60 * Math.random());
        await forTime(1000 * 60 * 10 * Math.random());
    }

    return WorkflowResult.SideEffect;
}

aiGeneratedWallpaperLand.initialize = prepareDiscordPage;

/**
 * [🏯] ??? DigitalOcean Referral Badge
 * TODO: LIB spacetrim should be able to modify prototype of string and add there a .spaceTrim() method
 */
