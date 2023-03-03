import chalk from 'chalk';
import { ElementHandle } from 'puppeteer-core';
import { forTime } from 'waitasecond';
import { forPlay } from '../../../../utils/forPlay';

export type FacebookLikeButtonStatus =
    | 'NONE'
    | 'LIKE'
    | 'LIKE_LOVE'
    | 'LIKE_CARE'
    | 'LIKE_HAHA'
    | 'LIKE_WOW'
    | 'LIKE_SAD'
    | 'LIKE_ANGRY'
    | 'UNKNOWN';

export async function getStatusOfFacebookLikeButton(
    elementHandle: ElementHandle<HTMLSpanElement>,
): Promise<FacebookLikeButtonStatus> {
    // console.log('getStatusOfFacebookLikeButton');
    await forPlay();

    const ariaLabel = await elementHandle.evaluate((element) => {
        return element.ariaLabel;
    });

    // console.log({ ariaLabel });

    if (!ariaLabel) {
        console.warn(chalk.bgRed(`Unexpected missing ariaLabel in Facebook button`), { elementHandle, ariaLabel });
        return 'UNKNOWN';
    }

    if (!/^Remove/i.test(ariaLabel)) {
        return 'NONE';
    }

    const innerText = await elementHandle.evaluate((element) => {
        return element.innerText;
    });

    // console.log({ innerText });

    if (innerText === 'Like') {
        return 'LIKE';
    } else if (innerText === 'Love') {
        return 'LIKE_LOVE';
    } else if (innerText === 'Care') {
        return 'LIKE_CARE';
    } else if (innerText === 'Haha') {
        return 'LIKE_HAHA';
    } else if (innerText === 'Wow') {
        return 'LIKE_WOW';
    } else if (innerText === 'Sad') {
        return 'LIKE_SAD';
    } else if (innerText === 'Angry') {
        return 'LIKE_ANGRY';
    } else {
        await elementHandle.evaluate((element) => {
            // TODO: [☮] Util markButton
            element.style.outline = '2px solid #ff0000';
        });

        console.warn(chalk.bgRed(`Unexpected text in Facebook button`), { innerText, ariaLabel });

        // await forTime(5000);
        // await forPlay();
        return 'UNKNOWN';
    }
}
