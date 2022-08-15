import { ElementHandle, Page } from 'puppeteer-core';

export async function clickOnText(page: Page, text: string): Promise<void> {
    // TODO: Escape text
    const elements = await page.$x(`//*[contains(.,"${text}")]`);

    if (elements.length === 0) {
        throw new Error(`No element found`);
    }

    const element = elements[elements.length - 1];
    await (element as ElementHandle<any>).click();
}
