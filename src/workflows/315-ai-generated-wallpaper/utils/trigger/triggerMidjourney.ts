import chalk from 'chalk';
import { Page } from 'puppeteer-core';
import { forTime } from 'waitasecond';
import { WAIT_MULTIPLICATOR } from '../../../../config';
import { forPlay } from '../../../../utils/forPlay';
import { clickOnTriggerButtonWithRetry } from './clickOnTriggerButtonWithRetry';
import { getStatusOfButtonWithRetry } from './getStatusOfButtonWithRetry';

export async function triggerMidjourney({
    discordPage,
    triggerMaxCount,
    scrollMaxPagesCount,
}: {
    discordPage: Page;
    triggerMaxCount: number | typeof Infinity;
    scrollMaxPagesCount: number | typeof Infinity;
}): Promise<{ triggeredCount: number; scrolledPagesCount: number }> {
    let triggeredCount = 0;
    let scrolledPagesCount = 0;

    /* TODO: [2]
  let lastLeadingHandle: any = null;
  */
    while (true) {
        const elementHandles = await discordPage.$$('button');

        /* TODO: [2]
    console.log(lastLeadingHandle, lastLeadingHandle === elementHandles[0]);
    if (lastLeadingHandle === identifyElementHandle(/* TODO: DRY * / elementHandles[0])) {
        // Note: Even if scrolled, the first element kept the same so I assume that we are at the top of the chat
        return skippingBecauseOf(`Nothing to trigger`);
    }
    lastLeadingHandle = identifyElementHandle(/* TODO: DRY * / elementHandles[0]);
    */
        for (const elementHandle of elementHandles.reverse()) {
            await forPlay();

            const text = await elementHandle.evaluate((element) => {
                // TODO: DRY [13]
                return element.innerText;
            });

            if (!['U1', 'U2', 'U3', 'U4'].includes(text)) {
                continue;
            }

            await elementHandle.evaluate((element) => {
                element.style.outline = '2px solid #cccccc';
            });

            const statusBeforeClick = await getStatusOfButtonWithRetry(elementHandle);

            if (statusBeforeClick === 'TRIGGERED') {
                console.info(chalk.gray(`⏩ Already triggered`) + ' ' + chalk.bgGray(text));
                continue;
            } else if (statusBeforeClick === 'UNKNOWN') {
                console.info(chalk.red(`⏩ Unknown status of button`) + ' ' + chalk.bgRed(text));
                continue;
            }

            await clickOnTriggerButtonWithRetry(elementHandle);

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

            // TODO: [🏯] Configurable waiting time
            let secondsToWaitBeforeClickingOnNextUpscale = 3 * WAIT_MULTIPLICATOR;
            await forTime(1000 * secondsToWaitBeforeClickingOnNextUpscale);
        }

        console.info(chalk.gray(`⬆ Scrolling up`));

        const newScrolledPagesCount = await discordPage.evaluate(async () => {
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
            const scrollableElements = Array.from(document.querySelectorAll(`div[class^=scroller-]`));
            const messagesElement = scrollableElements[scrollableElements.length - 1];

            for (let i = 0; i <= 500; i++) {
                scrolledPagesCount += 10 / window.innerHeight;
                messagesElement.scrollBy(0, -10);
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

/*
TODO: Maybe rename to triggerUpscale OR upscaleMidjourney - just think about better naming scheme of all AI
TODO: [2]
async function identifyElementHandle(handle: ElementHandle): Promise<any> {
    return handle.asElement();

    /*
      = await elementHandles[0].evaluate((element) => {
                  return element.innerHTML;
              });
* /
}
*/
