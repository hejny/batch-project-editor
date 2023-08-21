import OpenAI from 'openai';

export interface IAskChatGptOptions {
    requestText: string;
    // TODO: Model here GPT3 vs GPT4
}

export interface IAskChatGptReturn {
    responseText: string;
    metadataText: string;
}

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

export async function askChatGpt(options: IAskChatGptOptions): Promise<IAskChatGptReturn> {
    const { requestText } = options;

    const completion = await openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [
            {
                role: 'user',
                content: requestText,
            },
        ],
    });

    // Display response message to user
    const responseMessage = completion.choices[0].message.content;
    if (!responseMessage) {
        throw new Error(`No response from OpenAPI`);
    }

    return {
        responseText: responseMessage,
        metadataText: `Using ${completion.model}`,
    };
}
