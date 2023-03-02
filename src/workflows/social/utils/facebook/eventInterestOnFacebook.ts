import chalk from 'chalk';
import { ElementHandle, Page } from 'puppeteer-core';
import { forTime } from 'waitasecond';
import { WAIT_MULTIPLICATOR } from '../../../../config';
import { forPlay } from '../../../../utils/forPlay';
import { clickOnButton } from '../common/clickOnButton';
import { getStatusOfFacebookLikeButton } from './getStatusOfFacebookLikeButton';

// !!!!!!!!!! Like -> interested

export async function eventInterestOnFacebook({
    facebookPage,
    interestMaxCount,
    scrollMaxPagesCount,
}: {
    facebookPage: Page;
    interestMaxCount: number | typeof Infinity;
    scrollMaxPagesCount: number | typeof Infinity;
}): Promise<{ likeCount: number; scrolledPagesCount: number }> {
    let likeCount = 0;
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

            if (!/^(remove|like$)/i.test(label)) {
                continue;
            }

            await elementHandle.evaluate((element) => {
                element.style.outline = '2px solid #cccccc';
            });

            const statusBeforeClick = await getStatusOfFacebookLikeButton(elementHandle);

            if (statusBeforeClick.startsWith('LIKE')) {
                console.info(chalk.gray(`⏩ Already LIKED`));
                continue;
            } else if (statusBeforeClick === 'UNKNOWN') {
                console.info(chalk.red(`⏩ Unknown status of button`));
                continue;
            }

            await clickOnButton(elementHandle);

            // const statusAfterClick = await getStatusOfFacebookLikeButton(elementHandle);
            // console.log({ label, statusBeforeClick, statusAfterClick });

            likeCount++;

            console.info(
                chalk.cyan(
                    `Facebook event interested ${likeCount}x`,
                ) /* <- TODO: Report to console what was interested */,
            );

            if (likeCount >= interestMaxCount) {
                return { likeCount, scrolledPagesCount };
            }

            // TODO: [🏯] Configurable waiting time
            let secondsToWaitBeforeClickingNextLike = 30 * WAIT_MULTIPLICATOR;
            await forTime(1000 * secondsToWaitBeforeClickingNextLike);
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
            return { likeCount, scrolledPagesCount };
        }

        // console.log({ likeCount, scrolledPagesCount, likeMaxCount, scrollMaxPagesCount });
    }
}
