import { ChatGPTAPI } from 'chatgpt';
import { OPENAI_API_KEY } from '../../../config';

export interface IAskChatGptOptions {
    requestText: string;
    // TODO: Model here GPT3 vs GPT4
}

export interface IAskChatGptReturn {
    responseText: string;
    metadataText: string;
}

export async function askChatGpt(options: IAskChatGptOptions): Promise<IAskChatGptReturn> {
    const { requestText } = options;

    const chatGptApi = new ChatGPTAPI({
        apiKey: OPENAI_API_KEY,
        completionParams: {
            temperature: 0.5,
            top_p: 0.8,
        },
    });
    const response = await chatGptApi.sendMessage(requestText);

    return {
        responseText: response.text,
        metadataText: `@see ChatGPT API from ${new Date().toDateString()}`, // <- TODO: More info about the chat thread, GPT version, date,...,
    };
}
