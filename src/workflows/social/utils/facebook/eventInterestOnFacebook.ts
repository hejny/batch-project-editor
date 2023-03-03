import chalk from 'chalk';
import { ElementHandle, Page } from 'puppeteer-core';
import { forTime } from 'waitasecond';
import { WAIT_MULTIPLICATOR } from '../../../../config';
import { forPlay } from '../../../../utils/forPlay';
import { clickOnButton } from '../common/clickOnButton';

export async function eventInterestOnFacebook({
    facebookPage,
    interestMaxCount,
    scrollMaxPagesCount,
}: {
    facebookPage: Page;
    interestMaxCount: number | typeof Infinity;
    scrollMaxPagesCount: number | typeof Infinity;
}): Promise<{ interestedCount: number; scrolledPagesCount: number }> {
    let interestedCount = 0;
    let scrolledPagesCount = 0;

    /* TODO: [2]
  let lastLeadingHandle: any = null;
  */

    while (true) {
        const elementHandles = (await facebookPage.$$('*[role="button"]')) as ElementHandle<HTMLSpanElement>[];
        for (const elementHandle of elementHandles) {
            await forPlay();

            const label = await elementHandle.evaluate((element) => {
                // TODO: DRY [13]
                return element.getAttribute('aria-label') || '';
            });

            /*
            await elementHandle.evaluate((element) => {
                // TODO: [☮] Util markButton
                element.style.outline = '2px solid #ffff00';
            });
            /**/

            // console.log(label);

            if (!/^Interested$/i.test(label)) {
                continue;
            }

            await elementHandle.evaluate((element) => {
               // TODO: [☮] Util markButton
                element.style.outline = '2px solid #cccccc';
            });

            /*
            const statusBeforeClick = await getStatusOfFacebookLikeButton(elementHandle);

            if (statusBeforeClick.startsWith('LIKE')) {
                console.info(chalk.gray(`⏩ Already LIKED`));
                continue;
            } else if (statusBeforeClick === 'UNKNOWN') {
                console.info(chalk.red(`⏩ Unknown status of button`));
                continue;
            }
            */

            await clickOnButton(elementHandle);

            // TODO: [🏯] Configurable waiting time
            let secondsToWaitToInterested = 3; /* * WAIT_MULTIPLICATOR*/
            await forTime(1000 * secondsToWaitToInterested);

            // const statusAfterClick = await getStatusOfFacebookLikeButton(elementHandle);
            // console.log({ label, statusBeforeClick, statusAfterClick });

            interestedCount++;

            console.info(
                chalk.cyan(
                    `Facebook event interested ${interestedCount}x`,
                ) /* <- TODO: Report to console what was interested */,
            );

            if (interestedCount >= interestMaxCount) {
                return { interestedCount, scrolledPagesCount };
            }

            // TODO: [🏯] Configurable waiting time
            let secondsToWaitBeforeClickingNextInterested = 30 * WAIT_MULTIPLICATOR;
            await forTime(1000 * secondsToWaitBeforeClickingNextInterested);
        }


        console.info(chalk.gray(`⬇ Scrolling down`));

        const newScrolledPagesCount = await facebookPage.evaluate(async () => {
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
            return { interestedCount, scrolledPagesCount };
        }
    }
}
