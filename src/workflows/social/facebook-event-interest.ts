import chalk from 'chalk';
import { IWorkflowOptions, WorkflowResult } from '../IWorkflow';
import { eventSources } from './czech-events/eventSources';
import { eventInterestOnFacebook } from './utils/facebook/eventInterestOnFacebook';
import { getAdditionalFacebookPage, getFacebookPage, prepareFacebookPage } from './utils/facebook/facebookPage';

export async function socialFacebookEventInterest({
    skippingBecauseOf,
    projectPath,
    packageJson,
    madeSideEffect,
}: IWorkflowOptions): Promise<WorkflowResult> {
    const facebookPage = getFacebookPage();

    let interestedTotalCount = 0;

    for (const eventSource of eventSources) {
        console.info(chalk.cyan(`➿ Looking for events in ${eventSource}`));

        await facebookPage.goto(eventSource);

        //-----------------------------------------------------[ Each event ]---
        const elementHandles = await facebookPage.$$('a');
        const hrefs = new Set();
        for (const elementHandle of elementHandles) {
            const href = await elementHandle.evaluate((element) => {
                // TODO: DRY [13]
                return element.getAttribute('href') || '';
            });

            if (!/^https\:\/\/www.facebook.com\/events\/.*\/$/i.test(href)) {
                continue;
            }

            await elementHandle.evaluate((element) => {
               // TODO: [☮] Util markButton
                element.style.outline = '2px solid #cccccc';
            });

            if (hrefs.has(href)) {
                console.info(chalk.gray(`➿➿ Already looked on event ${href}`));
                continue;
            }

            hrefs.add(href);

            console.info(chalk.cyan(`➿➿ Looking on event ${href}`));

            const eventPage = await getAdditionalFacebookPage();
            await eventPage.goto(href, { waitUntil: 'networkidle2' });
            const { interestedCount, scrolledPagesCount } = await eventInterestOnFacebook({
                facebookPage: eventPage,
                interestMaxCount: 1,
                scrollMaxPagesCount: 0,
            });
            await eventPage.close();
            if (interestedCount) {
                console.info(chalk.green(`⏫ Interested in ${interestedCount} events`));
            } else {
                console.info(chalk.gray(`⏫ Interested in no events`));
            }

            interestedTotalCount += interestedCount;
        }

        //-----------------------------------------------------[ Page ]---
        const { interestedCount, scrolledPagesCount } = await eventInterestOnFacebook({
            facebookPage,
            interestMaxCount: 50,
            scrollMaxPagesCount: 1,
        });

        if (interestedCount) {
            console.info(chalk.green(`⏫ Interested in ${interestedCount} events`));
            console.info(chalk.green(`⏫ Scrolled ${scrolledPagesCount} pages`));
        } else {
            console.info(chalk.gray(`⏫ Interested in no events`));
        }

        interestedTotalCount += interestedCount;
    }

    if (interestedTotalCount) {
        return madeSideEffect(`Interested in ${interestedTotalCount} Facebook events`);
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
 * TODO: !!! Put CzechEvents into the name
 * TODO: Make some better system for workflows not connected with project
 */
