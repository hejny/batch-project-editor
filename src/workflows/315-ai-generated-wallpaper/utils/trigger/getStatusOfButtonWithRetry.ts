import { ElementHandle } from 'puppeteer-core';
import { forTime } from 'waitasecond';
import { WAIT_MULTIPLICATOR } from '../../../../config';
import { ButtonStatus, getStatusOfButton } from './getStatusOfButton';

export async function getStatusOfButtonWithRetry(elementHandle: ElementHandle): Promise<ButtonStatus> {
    // console.log('getStatusOfButtonWithRetry');
    const status = await getStatusOfButton(elementHandle, false);

    if (status !== 'UNKNOWN') {
        return status;
    }

    // TODO: [🏯] Configurable waiting time
    let secondsToRetryGettingButtonStatus = 5 * WAIT_MULTIPLICATOR;
    await forTime(1000 * secondsToRetryGettingButtonStatus);

    return await getStatusOfButton(elementHandle, true);
}
