import chalk from 'chalk';
import { IWorkflowOptions, WorkflowResult } from '../IWorkflow';
import { likesOnLinkedIn } from './utils/linkedin/likesOnLinkedIn';
import { getLinkedinPage, prepareLinkedinPage } from './utils/linkedin/linkedinPage';

export async function socialLinkedinLikes({
    skippingBecauseOf,
    projectPath,
    packageJson,
    madeSideEffect,
}: IWorkflowOptions): Promise<WorkflowResult> {
    const linkedinPage = getLinkedinPage();

    const { likeCount, scrolledPagesCount } = await likesOnLinkedIn({
        linkedinPage,
        likeMaxCount: 50,
        scrollMaxPagesCount: Infinity,
    });
    console.info(chalk.green(`⏫ Liked ${likeCount} LinkedIn posts`));
    console.info(chalk.green(`⏫ Scrolled ${scrolledPagesCount} pages`));

    if (likeCount) {
        return madeSideEffect(`Liked ${likeCount} LinkedIn posts`);
    } else {
        // TODO: [🥗] There should be 2 different returns: skippingBecauseOf VS notingChangedBecauseOf
        return skippingBecauseOf(`No liked LinkedIn posts`);
    }
}

socialLinkedinLikes.initialize = prepareLinkedinPage;

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
