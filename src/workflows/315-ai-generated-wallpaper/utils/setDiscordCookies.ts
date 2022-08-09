import { Page } from 'puppeteer-core';
import { forTime } from 'waitasecond';

export interface IDiscordCookies {
    // !!!
    //c_user: number;
    //xs: string;
}

export async function setDiscordCookies(
    page: Page,
    discordCookies: /*IDiscordCookies*/ any,
    discordLocalStorage: any,
): Promise<WorkflowResult> {
    for (const [name, value] of Object.entries(discordCookies)) {
        await page.setCookie({
            domain: '.discord.com',
            name,
            value: value as string,
        });
    }
    await forTime(5000);

    await page.evaluate((discordLocalStorage) => {
        console.log('window', window);
        for (const [name, value] of Object.entries(discordLocalStorage)) {
            localStorage.setItem(name, JSON.stringify(value as any));
        }
    }, discordLocalStorage);
}
