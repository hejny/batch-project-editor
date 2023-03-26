import { IWorkflowOptions } from '../../IWorkflow';
import { IAskChatBingOptions, IAskChatBingReturn, askChatBing } from './askChatBing';

const PROMPTS_CACHE_PATH = `documents/ai/prompts.json`;

type IPrompt = IAskChatBingOptions & IAskChatBingReturn;

export async function askChatBingCached(
    options: IAskChatBingOptions,
    utils: Pick<IWorkflowOptions, 'readJsonFile' | 'modifyJsonFile'>,
): Promise<IAskChatBingReturn> {
    const { requestText } = options;
    const { readJsonFile, modifyJsonFile } = utils;

    const prompts = await readJsonFile<Array<IPrompt>>(PROMPTS_CACHE_PATH);
    const prompt = prompts.find((prompt) => prompt.requestText === requestText);

    if (prompt) {
        return prompt;
    }

    /*/
    console.info({ requestText });
    throw new Error(`Request not cached`);
    /**/

    const response = await askChatBing(options);

    await modifyJsonFile<Array<IPrompt>>(PROMPTS_CACHE_PATH, (prompts) => [...(prompts || ([] as any)), prompt]);

    return response;
}

/**
 * TODO: Best place for the PROMPTS_CACHE_PATH file
 * TODO: Use YML for PROMPTS_CACHE_PATH file
 */
