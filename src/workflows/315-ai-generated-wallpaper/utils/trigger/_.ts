import chalk from 'chalk';
import { ElementHandle, Page } from 'puppeteer-core';
import { forTime } from 'waitasecond';
import { WAIT_MULTIPLICATOR } from '../../../../config';

// !!!!! Split to files AND beware of bottom jsdoc

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

/**
 *  Try to click multiple times when status is still BLANK
 */
async function clickOnTriggerButtonWithRetry(elementHandle: ElementHandle<HTMLButtonElement>): Promise<void> {
    // console.log('clickOnTriggerButtonWithRetry');

    const text = await elementHandle.evaluate((element) => {
        // TODO: DRY [13]
        return element.innerText;
    });

    for (let i = 0; i < 5; i++) {
        console.info(
            chalk.green(`👉 Clicking on`) +
                ' ' +
                chalk.bgGreen(text) +
                (i === 0 ? '' : ' ' + chalk.gray(`(${i + 1}. attempt)`)),
        );

        await clickOnTriggerButton(elementHandle);

        // TODO: [🏯] Configurable waiting time
        let secondsToWaitSecondsBeforeDetectingNewStatusOfTheButton = 2 * WAIT_MULTIPLICATOR;
        await forTime(1000 * secondsToWaitSecondsBeforeDetectingNewStatusOfTheButton);

        const statusAfterClick = await getStatusOfButtonWithRetry(elementHandle);

        if (statusAfterClick === 'TRIGGERED') {
            return;
        }
    }

    console.info(chalk.yellow(`🤼 Queue seems to be stucked`));
}

async function clickOnTriggerButton(elementHandle: ElementHandle<HTMLButtonElement>): Promise<void> {
    // console.log('clickOnTriggerButton');

    await elementHandle.focus(/* [9] Redundant */);
    await elementHandle.evaluate((element) => {
        element.focus(/* [9] Redundant */);
        element.style.outline = '2px solid #ff0000';
    });

    await elementHandle.click().catch((error) => {
        // Note: Do not throw here because sometimes happen that node is detached from document
        console.error(error);
    });
}

async function getStatusOfButtonWithRetry(elementHandle: ElementHandle): Promise<ButtonStatus> {
    // console.log('getStatusOfButtonWithRetry');

    const status = await getStatusOfButton(elementHandle, false);

    if (status !== 'UNKNOWN') {
        return status;
    }

    // TODO: [🏯] Configurable waiting time
    let secondsToRetryGettingButtonStatus = 5 * WAIT_MULTIPLICATOR;
    await forTime(1000 * secondsToRetryGettingButtonStatus);

    return await getStatusOfButton(elementHandle, true);
}

type ButtonStatus = 'BLANK' | 'TRIGGERED' | 'UNKNOWN';

async function getStatusOfButton(elementHandle: ElementHandle, isLogged: boolean): Promise<ButtonStatus> {
    // console.log('getStatusOfButton');

    const color = await elementHandle.evaluate((element) => {
        return window.getComputedStyle(element).backgroundColor;
    });

    if (color === 'rgb(79, 84, 92)' || color === 'rgb(104, 109, 115)') {
        return 'BLANK';
    } else if (
        color === 'rgb(88, 101, 242)' ||
        color === 'rgb(71, 82, 196)' ||
        color === 'rgb(45, 125, 70)' ||
        color === '@@@ rgb(45, 125, 70)'
    ) {
        return 'TRIGGERED';
    } else {
        if (isLogged) {
            console.info('Unknown color', { color });
        }
        return 'UNKNOWN';
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
