import chalk from 'chalk';
import { forTime } from 'waitasecond';
import { WAIT_MULTIPLICATOR } from '../../../config';
import { findElementHandle } from '../../../utils/puppeteer/findElementHandle';
import { markElement } from '../../../utils/puppeteer/markElement';
import { getChatBingPage } from './chatBingPage';

export async function askChatBing(requestText: string): Promise<string> {
    const chatBingPage = getChatBingPage();

    const newTopicButtonElementHandle = await findElementHandle(chatBingPage, {
        tagName: 'DIV',
        innerText: 'New topic',
    });
    if (newTopicButtonElementHandle === null) {
        throw new Error(`Can not find newTopicButtonElementHandle`);
    }
    await markElement(newTopicButtonElementHandle);
    await newTopicButtonElementHandle.click();
    await forTime(1000 * 5 /* seconds to switch new topic */);

    const preciseButtonElementHandle = await findElementHandle(chatBingPage, {
        tagName: 'SPAN',
        innerText: 'Precise',
    });
    if (preciseButtonElementHandle === null) {
        throw new Error(`Can not find preciseButtonElementHandle`);
    }
    await markElement(preciseButtonElementHandle);
    await preciseButtonElementHandle.click();
    await forTime(1000 * 5 /* seconds to switch precision level */);

    const searchboxElementHandle = await findElementHandle(chatBingPage, {
        tagName: 'TEXTAREA',
        id: 'searchbox',
    });
    if (searchboxElementHandle === null) {
        throw new Error(`Can not find searchboxElementHandle`);
    }
    await searchboxElementHandle.type(
        requestText.split('\n').join(' ').split(/\s+/g).join(' ') /* <- TODO: How to input code + multiline text */,
        { delay: 100 },
    );
    await forTime(1000 * 3 /* seconds after write */);

    const submitElementHandle = await findElementHandle(chatBingPage, {
        tagName: 'BUTTON',
        ariaLabel: 'Submit',
    });
    if (submitElementHandle === null) {
        throw new Error(`Can not find submitElementHandle`);
    }
    console.info(`🤖 Clicking on submit`);
    await submitElementHandle.click();

    // TODO: [🏯] Configurable waiting time
    let secondsToWaitAfterAsk = 60 * WAIT_MULTIPLICATOR;
    console.info(chalk.gray(`⏳ Waiting for ${secondsToWaitAfterAsk} seconds after asking Chat Bing`));
    await forTime(1000 * secondsToWaitAfterAsk);

    const responseElementHandle = await findElementHandle(chatBingPage, {
        // TODO: Scrape <cib-message><cib-shared/>
        tagName: 'CIB-SHARED',
    });
    if (responseElementHandle === null) {
        throw new Error(`Can not find responseElementHandle`);
    }
    await markElement(responseElementHandle);
    const responseText = await responseElementHandle.evaluate((element) => {
        return element.innerText;
    });

    return responseText;
}

/**
 * TODO: !!!!! Return some metadata
 * TODO: [🏯]
 */
