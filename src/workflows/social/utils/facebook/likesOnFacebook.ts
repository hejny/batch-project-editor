import chalk from 'chalk';
import { ElementHandle, Page } from 'puppeteer-core';
import { forTime } from 'waitasecond';
import { WAIT_MULTIPLICATOR } from '../../../../config';
import { forPlay } from '../../../../utils/forPlay';
import { clickOnButton } from '../common/clickOnButton';
import { getStatusOfFacebookLikeButton } from './getStatusOfFacebookLikeButton';

export async function likesOnFacebook({
    facebookPage,
    likeMaxCount,
    scrollMaxPagesCount,
}: {
    facebookPage: Page;
    likeMaxCount: number | typeof Infinity;
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

            if (!/^(like|(remove [a-z]+))$/i.test(label)) {
                continue;
            }

            const type = await elementHandle.evaluate((element) => {
                // Note: Post fontSize 14px ; Comment fontSize 12px;
                //return parseInt(window.getComputedStyle(element).fontSize, 10);

                // Note: Post width 195.328125px ; Comment width 22.578125px;
                return element.getBoundingClientRect().width > 100 ? 'POST' : 'COMMENT';
            });

            if (type === 'COMMENT') {
                await elementHandle.evaluate((element) => {
                    // TODO: [☮] Util markButton
                    element.style.outline = '2px solid #888888';
                });
                console.info(chalk.gray(`⏩ Skipping comment button`));
                continue;
            }

            await elementHandle.evaluate((element) => {
                // TODO: [☮] Util markButton
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

            console.info(chalk.cyan(`Facebook liked ${likeCount}x` /* <- TODO: Report to console what was liked */));

            if (likeCount >= likeMaxCount) {
                return { likeCount, scrolledPagesCount };
            }

            // TODO: [🏯] Configurable waiting time
            let secondsToWaitBeforeClickingNextLike = 30 * WAIT_MULTIPLICATOR;
            await forTime(1000 * secondsToWaitBeforeClickingNextLike);
            await forPlay();
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
