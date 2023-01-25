import chalk from 'chalk';
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

    let lastLeadingHandle: any = null;

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

            // Window.getComputedStyle()

            // !!! TODO: [6] Click only if not yet clicked
            elementHandle.click();
            console.info(chalk.cyan(`Clicked on`) + ' ' + chalk.bgCyan(` [ ${text} ] `));
            // TODO: !!!!!! return madeSideEffect(`Triggered ${text}`);

            // !!! Remove
            await forTime(5 * 1000);
        }

        //!!! Scroll up
        console.info(chalk.gray(`Scrolling up`));

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
