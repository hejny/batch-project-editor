import spaceTrim from 'spacetrim';
import { forTime } from 'waitasecond';
import { findElementHandle } from '../../utils/puppeteer/findElementHandle';
import { markElement } from '../../utils/puppeteer/markElement';
import { IWorkflowOptions, WorkflowResult } from '../IWorkflow';
import { getChatBingPage, prepareChatBingPage } from './utils/chatBingPage';

export async function writeAnotations({
    modifyFiles,
    modifyJsonFile,
    commit,
}: IWorkflowOptions): Promise<WorkflowResult> {
    const chatBingPage = getChatBingPage();

    await modifyFiles('**/*.{ts,tsx,js,jsx}', async (filePath, fileContent) => {
        if (fileContent.split('@@@').length !== 2) {
            console.info(`⬜ File ${filePath} has none or multiple anotation missing marks `);
            return null;
        }

        // TODO: !!! Omit things like imports, empty comments / anotations , code comments, indentation,...

        const fileContentEssentials = fileContent
            .split(/^import.*$/gm)
            .join('')
            .split(/^\s*\/\/.*$/gm)
            .join('')
            .split(/\/\*.*?\*\//gs)
            .join('');

        /*
        console.log('---------------------------------');
        console.log(fileContent);
        console.log('---------------------------------');
        console.log(fileContentEssentials);
        console.log('---------------------------------');
        */

        const requestText = spaceTrim(
            (block) => `

                Complete jsdoc tags everywhere there is "@@@":

                ${block(fileContentEssentials)}

             `,
        );

        // !!!!! requestMultilineText vs requestText
        // !!! Limit requestText to 2000 characters

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
        await forTime(1000 * 90 /* seconds to response */);

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

        fileContent = fileContent.split('@@@').join(responseText.split('\n').join(' '));

        await modifyJsonFile<Array<{ requestText: string; responseText: string }>>(
            `documents/ai/prompts.json` /* <- TODO: Best place for the file + probbably use YAML */,
            (promptsContent) => [...(promptsContent || []), { requestText, responseText }],
        );

        return fileContent;
    });

    return commit(
        spaceTrim(`
            💭 Write anotations

            Written by Chat Bing
        `), // <- TODO: More info about the chat thread, GPT version, date,...
    );
}

writeAnotations.initialize = prepareChatBingPage;
