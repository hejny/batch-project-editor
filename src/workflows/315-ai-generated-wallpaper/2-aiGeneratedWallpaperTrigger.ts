import chalk from 'chalk';
import { IWorkflowOptions, WorkflowResult } from '../IWorkflow';
import { getDiscordPage, prepareDiscordPage } from './utils/discordPage';
import { triggerMidjourney } from './utils/trigger/_';

export async function aiGeneratedWallpaperTrigger({
    skippingBecauseOf,
    projectPath,
    packageJson,
    madeSideEffect,
}: IWorkflowOptions): Promise<WorkflowResult> {
    const discordPage = getDiscordPage();

    const { triggeredCount, scrolledPagesCount } = await triggerMidjourney({
        discordPage,
        triggerMaxCount: Infinity,
        scrollMaxPagesCount: Infinity,
    });
    console.info(chalk.green(`⏫ Triggered ${triggeredCount} images`));
    console.info(chalk.green(`⏫ Scrolled ${scrolledPagesCount} pages`));

    if (triggeredCount) {
        return madeSideEffect(`Triggered ${triggeredCount} buttons `);
    } else {
        // TODO: [🥗] There should be 2 different returns: skippingBecauseOf VS notingChangedBecauseOf
        return skippingBecauseOf(`No button triggered `);
    }
}

aiGeneratedWallpaperTrigger.initialize = prepareDiscordPage;

/**
 * TODO: Maybe ACRY rename trigger to upscale
 * TODO: --loop 60

[🏯] Remove unused and better organize
DISCORD_SEARCHRESULTS_QUERYSELECTOR;
DISCORD_SEARCHRESULTS_ITEM__QUERYSELECTOR;
DISCORD_MESSAGE__QUERYSELECTOR;

*/
