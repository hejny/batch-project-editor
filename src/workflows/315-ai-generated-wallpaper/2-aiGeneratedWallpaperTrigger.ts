import chalk from 'chalk';
import { readFile } from 'fs/promises';
import { join } from 'path';
import spaceTrim from 'spacetrim';
import { forTime } from 'waitasecond';
import { IWorkflowOptions, WorkflowResult } from '../IWorkflow';
import { DISCORD_MESSAGE_QUERYSELECTOR, getDiscordPage, prepareDiscordPage } from './discordPage';
import { searchMidjourney } from './utils/searchMidjourney/searchMidjourney';

export async function aiGeneratedWallpaperTrigger({
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


    const discordPage = getDiscordPage();

    return WorkflowResult.SideEffect;
}

aiGeneratedWallpaperTrigger.initialize = prepareDiscordPage;
