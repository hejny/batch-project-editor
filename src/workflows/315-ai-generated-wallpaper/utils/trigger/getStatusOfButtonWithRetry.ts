import { ElementHandle } from 'puppeteer-core';
import { forTime } from 'waitasecond';
import { WAIT_MULTIPLICATOR } from '../../../../config';
import { forPlay } from '../../../../utils/forPlay';
import { ButtonStatus, getStatusOfButton } from './getStatusOfButton';

export async function getStatusOfButtonWithRetry(elementHandle: ElementHandle<HTMLButtonElement>): Promise<ButtonStatus> {
    // console.log('getStatusOfButtonWithRetry');
    await forPlay();
    const status = await getStatusOfButton(elementHandle, false);

    if (status !== 'UNKNOWN') {
        return status;
    }

    // TODO: [🏯] Configurable waiting time
    let secondsToRetryGettingButtonStatus = 5 * WAIT_MULTIPLICATOR;
    await forTime(1000 * secondsToRetryGettingButtonStatus);
    await forPlay();

    return await getStatusOfButton(elementHandle, true);
}

/**
 * TODO: Reanme - add discord to name like getStatusOfDiscordButtonWithRetry
 */
