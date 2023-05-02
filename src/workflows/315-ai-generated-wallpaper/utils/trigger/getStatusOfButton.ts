import { ElementHandle } from 'puppeteer-core';
import { forPlay } from '../../../../utils/forPlay';

export type ButtonStatus = 'BLANK' | 'TRIGGERED' | 'UNKNOWN';

/**
 * Gets the status of a button element based on its background color ⁘
 *
 * @param {ElementHandle<HTMLButtonElement>} elementHandle - The handle of the button element.
 * @param {boolean} isLogged - A flag that indicates whether the user is logged in or not.
 * @returns {Promise<ButtonStatus>} A promise that resolves to the status of the button element.
 */
export async function getStatusOfButton(
    elementHandle: ElementHandle<HTMLButtonElement>,
    isLogged: boolean,
): Promise<ButtonStatus> {
    // console.log('getStatusOfButton');
    await forPlay();
    const color = await elementHandle.evaluate((element) => {
        return window.getComputedStyle(element).backgroundColor;
    });

    if (color === 'rgb(79, 84, 92)' || color === 'rgb(104, 109, 115)' || color === 'rgb(78, 80, 88)') {
        return 'BLANK';
    } else if (
        color === 'rgb(88, 101, 242)' ||
        color === 'rgb(71, 82, 196)' ||
        color === 'rgb(45, 125, 70)' ||
        color === '@@' + '@ rgb(45, 125, 70)'
    ) {
        return 'TRIGGERED';
    } else {
        if (isLogged) {
            console.info('Unknown color', { color });
        }
        return 'UNKNOWN';
    }
}

/**
 * TODO: Rename ButtonStatus to DiscordButtonStatus
 * TODO: Reanme - add discord to name like getStatusOfDiscordButton
 */
