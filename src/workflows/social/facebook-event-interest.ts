import chalk from 'chalk';
import { IWorkflowOptions, WorkflowResult } from '../IWorkflow';
import { eventInterestOnFacebook } from './utils/facebook/eventInterestOnFacebook';
import { getFacebookPage, prepareFacebookPage } from './utils/facebook/facebookPage';

export async function socialFacebookEventInterest({
    skippingBecauseOf,
    projectPath,
    packageJson,
    madeSideEffect,
}: IWorkflowOptions): Promise<WorkflowResult> {
    const facebookPage = getFacebookPage();

    const { likeCount, scrolledPagesCount } = await eventInterestOnFacebook({
        facebookPage,
        interestMaxCount: Infinity,
        scrollMaxPagesCount: Infinity,
    });
    console.info(chalk.green(`⏫ Interested in ${likeCount} Facebook Events`));
    console.info(chalk.green(`⏫ Scrolled ${scrolledPagesCount} pages`));

    if (likeCount) {
        return madeSideEffect(`Interested in ${likeCount} Facebook events`);
    } else {
        // TODO: [🥗] There should be 2 different returns: skippingBecauseOf VS notingChangedBecauseOf
        return skippingBecauseOf(`Interested in no Facebook events`);
    }
}

socialFacebookEventInterest.initialize = prepareFacebookPage;

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
