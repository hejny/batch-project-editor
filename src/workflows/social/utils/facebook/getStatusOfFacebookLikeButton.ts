import chalk from 'chalk';
import { ElementHandle } from 'puppeteer-core';
import { forPlay } from '../../../../utils/forPlay';

export type FacebookLikeButtonStatus =
    | 'NONE'
    | 'LIKE'
    | 'LIKE_CELEBRATE'
    | 'LIKE_SUPPORT'
    | 'LIKE_FUNNY'
    | 'LIKE_LOVE'
    | 'LIKE_INSIGHTFUL'
    | 'UNKNOWN' /* <- !!! TODO: Add all */;

export async function getStatusOfFacebookLikeButton(
    elementHandle: ElementHandle<HTMLButtonElement>,
): Promise<FacebookLikeButtonStatus> {
    // console.log('getStatusOfFacebookLikeButton');
    await forPlay();

    const ariaPressed = await elementHandle.evaluate((element) => {
        return element.ariaPressed;
    });

    // console.log({ ariaPressed });

    if (!ariaPressed || ariaPressed === 'false') {
        return 'NONE';
    }

    const innerText = await elementHandle.evaluate((element) => {
        return element.innerText;
    });

    // console.log({ innerText });

    if (innerText === 'Like') {
        return 'LIKE';
    } else if (innerText === 'Celebrate') {
        return 'LIKE_CELEBRATE';
    } else if (innerText === 'Support') {
        return 'LIKE_SUPPORT';
    } else if (innerText === 'Funny') {
        return 'LIKE_FUNNY';
    } else if (innerText === 'Love') {
        return 'LIKE_LOVE';
    } else if (innerText === 'Insightful') {
        return 'LIKE_INSIGHTFUL';
    } else {
        console.warn(chalk.bgRed(`Unexpected text in Facebook button`), { innerText });
        return 'UNKNOWN';
    }
}
