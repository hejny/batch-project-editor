import spaceTrim from 'spacetrim';
import { IWorkflowOptions, WorkflowResult } from '../IWorkflow';
import { askChatBing } from './utils/askChatBing';
import { prepareChatBingPage } from './utils/chatBingPage';

export async function writeAnotations({
    modifyFiles,
    modifyJsonFile,
    commit,
}: IWorkflowOptions): Promise<WorkflowResult> {
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

        const responseText = await askChatBing('requestText');

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
