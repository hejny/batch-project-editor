import { ElementHandle } from 'puppeteer-core';
import { forPlay } from '../../../../utils/forPlay';

export async function clickOnTriggerButton(elementHandle: ElementHandle<HTMLButtonElement>): Promise<void> {
    // console.log('clickOnTriggerButton');

    await forPlay();
    await elementHandle.focus(/* [9] Redundant */);
    await elementHandle.evaluate((element) => {
        element.focus(/* [9] Redundant */);
        // TODO: [☮] Util markButton
        element.style.outline = '2px solid #00ff00';
    });

    await elementHandle.click().catch((error) => {
        // Note: Do not throw here because sometimes happen that node is detached from document
        console.error(error);
    });
}

/**
 * TODO: Reanme - add discord to name like clickOnDiscordButton
 */
