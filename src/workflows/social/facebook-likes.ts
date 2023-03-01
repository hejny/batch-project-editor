import chalk from 'chalk';
import { IWorkflowOptions, WorkflowResult } from '../IWorkflow';
import { getFacebookPage, prepareFacebookPage } from './utils/facebook/facebookPage';
import { likesOnFacebook } from './utils/facebook/likesOnFacebook';

export async function socialFacebookLikes({
    skippingBecauseOf,
    projectPath,
    packageJson,
    madeSideEffect,
}: IWorkflowOptions): Promise<WorkflowResult> {
    const facebookPage = getFacebookPage();

    const { likeCount, scrolledPagesCount } = await likesOnFacebook({
        facebookPage,
        likeMaxCount: 50,
        scrollMaxPagesCount: Infinity,
    });
    console.info(chalk.green(`⏫ Triggered ${likeCount} images`));
    console.info(chalk.green(`⏫ Scrolled ${scrolledPagesCount} pages`));

    if (likeCount) {
        return madeSideEffect(`Triggered ${likeCount} buttons`);
    } else {
        // TODO: [🥗] There should be 2 different returns: skippingBecauseOf VS notingChangedBecauseOf
        return skippingBecauseOf(`No button triggered`);
    }
}

socialFacebookLikes.initialize = prepareFacebookPage;

/**
 * TODO: Maybe ACRY rename trigger to upscale
 * TODO: --loop 60

[🏯] Remove unused and better organize
DISCORD_SEARCHRESULTS_QUERYSELECTOR;
DISCORD_SEARCHRESULTS_ITEM__QUERYSELECTOR;
DISCORD_MESSAGE__QUERYSELECTOR;

*/

/**
 * TODO: Make some better system for workflows not connected with project
 */
