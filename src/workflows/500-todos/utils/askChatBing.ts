import chalk from 'chalk';
import { forTime } from 'waitasecond';
import { forPlay } from '../../../utils/forPlay';
import { findElementHandle } from '../../../utils/puppeteer/findElementHandle';
import { findLastElementHandle } from '../../../utils/puppeteer/findLastElementHandle';
import { markElement } from '../../../utils/puppeteer/markElement';
import { getChatBingPage } from './chatBingPage';
import { normalizeChatRequestText } from './normalizeChatRequestText';

export interface IAskChatBingOptions {
    requestText: string;

    // TODO: Precise vs Normal vs Creative here
}

export interface IAskChatBingReturn {
    responseText: string;
    responseHtml: string;
    metadataText: string;
}

export async function askChatBing(options: IAskChatBingOptions): Promise<IAskChatBingReturn> {
    const { requestText } = options;

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
    await forPlay();

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
    await forPlay();

    const searchboxElementHandle = await findElementHandle(chatBingPage, {
        tagName: 'TEXTAREA',
        id: 'searchbox',
    });
    if (searchboxElementHandle === null) {
        throw new Error(`Can not find searchboxElementHandle`);
    }

    const requestTextNormalized = normalizeChatRequestText(requestText);
    console.info(`🎹 Writing ${requestTextNormalized.length} chars of the request`);
    await searchboxElementHandle.type(requestTextNormalized, { delay: 5 });
    await forTime(1000 * 3 /* seconds after write */);
    await forPlay();

    const submitElementHandle = await findElementHandle(chatBingPage, {
        tagName: 'BUTTON',
        ariaLabel: 'Submit',
    });
    if (submitElementHandle === null) {
        throw new Error(`Can not find submitElementHandle`);
    }

    console.log(submitElementHandle);
    console.info(`🤖 Clicking on submit`);
    await submitElementHandle.click();

    while (true) {
        console.info(chalk.gray(`⏳ Waiting for Chat Bing to respond`));
        await forTime(1000 * 2);
        await forPlay();

        const stopRespondingElementHandle = await findElementHandle(chatBingPage, {
            tagName: 'BUTTON',
            id: 'stop-responding-button',
            disabled: false,
        });

        if (stopRespondingElementHandle === null) {
            break;
        }

        await markElement(stopRespondingElementHandle, '#777777');
    }

    const responseElementHandle = await findLastElementHandle(chatBingPage, {
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
    const responseHtml = await responseElementHandle.evaluate((element) => {
        return element.innerHTML;
    });

    return {
        responseText,
        responseHtml,
        metadataText: `@see ChatBing from ${new Date().toDateString()}`, // <- TODO: More info about the chat thread, GPT version, date,...,
    };
}

/**
 * TODO: requestMultilineText vs requestText
 * TODO: [🏯]
 */
