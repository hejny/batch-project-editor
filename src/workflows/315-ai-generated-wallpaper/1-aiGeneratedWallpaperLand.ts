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
    packageJson,
}: IWorkflowOptions): Promise<WorkflowResult> {
    // !!! Dry to some util
    const wallpaperPath = join(projectPath, '/assets/ai/wallpaper/');
    const wallpaperImaginePath = join(wallpaperPath, 'imagine');
    const wallpaperImagineContents = await readFile(wallpaperImaginePath, 'utf8');
    const imagine = spaceTrim(wallpaperImagineContents).split('\n\n')[0].split('\n').join(' ').split('  ').join(' ');
    const imagineSentence = spaceTrim(
      imagine.split(/--[a-zA-Z]+\s+[^\s]+\s*/g).join(''),
      // TODO: LIB spacetrim should be able to modify prototype of string and add there a .spaceTrim() method
  );

    // Note: Test if already landed
    const searchResult = await searchMidjourney({ prompt: imagineSentence });
    if (searchResult.length > 0) {
        return skippingBecauseOf(`Already landed "${imagineSentence}"`);
    }

    const discordPage = getDiscordPage();

    console.log(chalk.blue(imagine));

    await discordPage.type(DISCORD_MESSAGE_QUERYSELECTOR, '/imagine ' + imagine, { delay: 50 });
    await discordPage.keyboard.press('Enter');

    await forTime(1000 * 60 * Math.random());
    return WorkflowResult.SideEffect;
}

aiGeneratedWallpaperLand.initialize = prepareDiscordPage;

/**
 * !!! ??? DigitalOcean Referral Badge
 */
