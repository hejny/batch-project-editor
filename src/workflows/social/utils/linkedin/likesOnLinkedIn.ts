import chalk from 'chalk';
import { Page } from 'puppeteer-core';
import { forTime } from 'waitasecond';
import { WAIT_MULTIPLICATOR } from '../../../../config';
import { forPlay } from '../../../../utils/forPlay';
import { getStatusOfLinkedinLikeButton } from './getStatusOfLinkedinLikeButton';
import { clickOnButton } from '../common/clickOnButton';

export async function likesOnLinkedIn({
    linkedinPage,
    likeMaxCount,
    scrollMaxPagesCount,
}: {
    linkedinPage: Page;
    likeMaxCount: number | typeof Infinity;
    scrollMaxPagesCount: number | typeof Infinity;
}): Promise<{ likeCount: number; scrolledPagesCount: number }> {
    let likeCount = 0;
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

            if (!/^(un)?like.*post/i.test(label)) {
                continue;
            }

            await elementHandle.evaluate((element) => {
                element.style.outline = '2px solid #cccccc';
            });

            const statusBeforeClick = await getStatusOfLinkedinLikeButton(elementHandle);

            if (statusBeforeClick.startsWith('LIKE')) {
                console.info(chalk.gray(`⏩ Already LIKED`));
                continue;
            } else if (statusBeforeClick === 'UNKNOWN') {
                console.info(chalk.red(`⏩ Unknown status of button`));
                continue;
            }

            await clickOnButton(elementHandle);

            //const statusAfterClick = await getStatusOfLinkedinLikeButton(elementHandle);
            // console.log({ label, statusBeforeClick, statusAfterClick });

            likeCount++;

            console.info(chalk.cyan(`Liked ${likeCount}x`));

            if (likeCount >= likeMaxCount) {
                return { likeCount, scrolledPagesCount };
            }

            // TODO: [🏯] Configurable waiting time
            let secondsToWaitBeforeClickingNextLike = 30 * WAIT_MULTIPLICATOR;
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
            return { likeCount, scrolledPagesCount };
        }

        console.log({ likeCount, scrolledPagesCount, likeMaxCount, scrollMaxPagesCount });
    }
}
