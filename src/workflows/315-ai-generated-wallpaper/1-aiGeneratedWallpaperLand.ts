import { readFile } from 'fs/promises';
import { join } from 'path';
import spaceTrim from 'spacetrim';
import { IWorkflowOptions, WorkflowResult } from '../IWorkflow';
import { getDiscordPage, prepareDiscordPage } from './discordPage';
import { searchMidjourney } from './utils/searchMidjourney/searchMidjourney';

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

    const discordPage = getDiscordPage();

    //aria-label="Hledat"
    const search = `od: MidJourney Bot#9282 "Sample of tray module for virtual online whiteboard"`;

    /*
    !!! Implement
    for(){

    await forTime(1000 * 60 * 15 * Math.random());



    }


    return WorkflowResult.SideEffect;
     */

    return skippingBecauseOf(`Not implemented yet`);
}

aiGeneratedWallpaperLand.initialize = prepareDiscordPage;

/**
 * !!! ??? DigitalOcean Referral Badge
 */
