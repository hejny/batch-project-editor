import chalk from 'chalk';
import { ElementHandle } from 'puppeteer-core';
import { forTime } from 'waitasecond';
import { WAIT_MULTIPLICATOR } from '../../../../config';
import { forPlay } from '../../../../utils/forPlay';
import { clickOnTriggerButton } from './clickOnTriggerButton';
import { getStatusOfButtonWithRetry } from './getStatusOfButtonWithRetry';

/**
 *  Try to click multiple times when status is still BLANK
 */

export async function clickOnTriggerButtonWithRetry(elementHandle: ElementHandle<HTMLButtonElement>): Promise<void> {
    // console.log('clickOnTriggerButtonWithRetry');

    await forPlay();
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
        await forPlay();

        const statusAfterClick = await getStatusOfButtonWithRetry(elementHandle);

        if (statusAfterClick === 'TRIGGERED') {
            return;
        }
    }

    console.info(chalk.yellow(`🤼 Queue seems to be stucked`));
}


/**
 * TODO: Reanme - add discord to name like clickOnDiscordButtonWithRetry
 */