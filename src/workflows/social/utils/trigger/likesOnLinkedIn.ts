import chalk from 'chalk';
import { Page } from 'puppeteer-core';
import { forTime } from 'waitasecond';
import { WAIT_MULTIPLICATOR } from '../../../../config';
import { forPlay } from '../../../../utils/forPlay';
import { clickOnLinkedinLikeButton } from './clickOnLinkedinLikeButton';

export async function likesOnLinkedIn({
    linkedinPage,
    triggerMaxCount,
    scrollMaxPagesCount,
}: {
    linkedinPage: Page;
    triggerMaxCount: number | typeof Infinity;
    scrollMaxPagesCount: number | typeof Infinity;
}): Promise<{ triggeredCount: number; scrolledPagesCount: number }> {
    let triggeredCount = 0;
    let scrolledPagesCount = 0;

    /* TODO: [2]
  let lastLeadingHandle: any = null;
  */
    while (true) {
        const elementHandles = await linkedinPage.$$('button');

        for (const elementHandle of elementHandles) {
            await forPlay();

            const label = await elementHandle.evaluate((element) => {
                // TODO: DRY [13]
                return element.getAttribute('aria-label') || '';
            });

            // TODO: !!! Also ^dislike
            if (!/^like/i.test(label)) {
                continue;
            }

            await elementHandle.evaluate((element) => {
                element.style.outline = '2px solid #cccccc';
            });

            /* TODO: !!!>
            const statusBeforeClick = await getStatusOfButtonWithRetry(elementHandle);

            if (statusBeforeClick === 'TRIGGERED') {
                console.info(chalk.gray(`⏩ Already triggered`) + ' ' + chalk.bgGray(text));
                continue;
            } else if (statusBeforeClick === 'UNKNOWN') {
                console.info(chalk.red(`⏩ Unknown status of button`) + ' ' + chalk.bgRed(text));
                continue;
            }
            */

            await clickOnLinkedinLikeButton(elementHandle);

            if (triggeredCount >= triggerMaxCount) {
                return { triggeredCount, scrolledPagesCount };
            }
            /*
            const statusAfterClick = await getStatusOfButtonWithRetry(elementHandle);


            // console.log({ statusBeforeClick, statusAfterClick });
            if (statusAfterClick === 'TRIGGERED') {
                triggeredCount++;

                if (triggeredCount >= triggerMaxCount) {
                    return { triggeredCount, scrolledPagesCount };
                }
            } else if (statusAfterClick === 'BLANK') {
                // TODO: [🏯] Configurable waiting time
                let secondsToWaitToFinishUpQueue = 60 * 2 * WAIT_MULTIPLICATOR;
                console.info(
                    chalk.gray(
                        `⏳ Waiting for ${secondsToWaitToFinishUpQueue} seconds to MidJourney to finish up the queue`,
                    ),
                );
                await forTime(1000 * secondsToWaitToFinishUpQueue);

                continue;
            } else if (statusAfterClick === 'UNKNOWN') {
                console.info(
                    chalk.red(`👉 Clicked on `) + ' ' + chalk.bgRed(text) + ' ' + chalk.red(`but unknown thing happen`),
                );
            }

            */

            // TODO: [🏯] Configurable waiting time
            let secondsToWaitBeforeClickingNextLike = 3 * WAIT_MULTIPLICATOR;
            await forTime(1000 * secondsToWaitBeforeClickingNextLike);
        }

        console.info(chalk.gray(`⬇ Scrolling down`));

        const newScrolledPagesCount = await linkedinPage.evaluate(async () => {
            function forAnimationFrame(): Promise<void> {
                return new Promise((resolve) => {
                    requestAnimationFrame(() => {
                        resolve();
                    });

                    setTimeout(() => {
                        resolve();
                    }, 10);
                });
            }

            let scrolledPagesCount = 0;

            for (let i = 0; i <= 500; i++) {
                scrolledPagesCount += 10 / window.innerHeight;
                window.scrollBy(0, 10);
                await forAnimationFrame();
            }

            return scrolledPagesCount;
        });

        scrolledPagesCount += newScrolledPagesCount;

        if (scrolledPagesCount >= scrollMaxPagesCount) {
            return { triggeredCount, scrolledPagesCount };
        }

        console.log({ triggeredCount, scrolledPagesCount, triggerMaxCount, scrollMaxPagesCount });
    }
}
