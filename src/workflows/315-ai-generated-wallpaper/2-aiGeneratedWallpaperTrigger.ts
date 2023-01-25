import chalk from 'chalk';
import { ElementHandle } from 'puppeteer-core';
import { forTime } from 'waitasecond';
import { IWorkflowOptions, WorkflowResult } from '../IWorkflow';
import { getDiscordPage, prepareDiscordPage } from './utils/discordPage';

export async function aiGeneratedWallpaperTrigger({
    skippingBecauseOf,
    projectPath,
    packageJson,
    madeSideEffect,
}: IWorkflowOptions): Promise<WorkflowResult> {
    const discordPage = getDiscordPage();

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
                return element.innerText;
            });

            if (!['U1', 'U2' /* !!! More + Upscales */].includes(text)) {
                continue;
            }

            elementHandle.focus();

            // [6] const elementImage = await elementHandle.screenshot() as Buffer;
            // [6] console.log(elementImage);

            await forTime(500);

            const status = await getStatusOfButton(elementHandle);

            if (status === 'TRIGGERED') {
                console.info(chalk.gray(`⏩ Already triggered`) + ' ' + chalk.bgGray(text));
                continue;
            } else if (status === 'UNKNOWN') {
                console.info(chalk.red(`⏩ Unknown status of button`) + ' ' + chalk.bgRed(text));
                continue;
            }

            elementHandle.click();
            await forTime(1000 * 2 /* seconds before detecting new status of the button */);

            const statusAfterClick = await getStatusOfButton(elementHandle);

            if (statusAfterClick === 'TRIGGERED') {
                console.info(chalk.green(`👉 Clicked on`) + ' ' + chalk.bgGreen(text));
                // return madeSideEffect(`Triggered ${text}`);
            } else if (statusAfterClick === 'BLANK') {
                console.info(
                    chalk.yellow(`👉 Clicked on`) +
                        ' ' +
                        chalk.bgYellow(text) +
                        ' ' +
                        chalk.yellow(`but queue is stucked`),
                );
                console.info(chalk.gray(`⏳ Waiting for 2 minutes to MidJourney finish up the queue`));
                await forTime(1000 * 60 * 2 /* minutes */);
                continue;
            } else if (statusAfterClick === 'UNKNOWN') {
                console.info(
                    chalk.red(`👉 Clicked on `) + ' ' + chalk.bgRed(text) + ' ' + chalk.red(`but unknown thing happen`),
                );
            }

            await forTime(1000 * 3 /* seconds before clicking on next button */);
        }

        console.info(chalk.gray(`⬆ Scrolling up`));

        await discordPage.evaluate(() => {
            const scrollableElements = Array.from(document.querySelectorAll(`div[class^=scroller-]`));
            const messagesElement = scrollableElements[scrollableElements.length - 1];
            messagesElement.scrollBy(0, window.innerHeight * -0.8);
        });
    }
}

aiGeneratedWallpaperTrigger.initialize = prepareDiscordPage;

/*
TODO: --loop 60

[🏯] Remove unused and better organize
DISCORD_SEARCHRESULTS_QUERYSELECTOR;
DISCORD_SEARCHRESULTS_ITEM__QUERYSELECTOR;
DISCORD_MESSAGE__QUERYSELECTOR;

*/

async function getStatusOfButton(elementHandle: ElementHandle): Promise<'BLANK' | 'TRIGGERED' | 'UNKNOWN'> {
    const color = await elementHandle.evaluate((element) => {
        return window.getComputedStyle(element).backgroundColor;
    });

    if (color === 'rgb(79, 84, 92)') {
        return 'BLANK';
    } else if (color === 'rgb(88, 101, 242)') {
        return 'TRIGGERED';
    } else {
        console.info('Unknown color', { color });
        return 'UNKNOWN';
    }
}

/*
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
