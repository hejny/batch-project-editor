import { ElementHandle } from 'puppeteer-core';

export type ButtonStatus = 'BLANK' | 'TRIGGERED' | 'UNKNOWN';

export async function getStatusOfButton(elementHandle: ElementHandle, isLogged: boolean): Promise<ButtonStatus> {
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