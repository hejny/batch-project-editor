import { ElementHandle } from 'puppeteer-core';

export async function clickOnTriggerButton(elementHandle: ElementHandle<HTMLButtonElement>): Promise<void> {
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
