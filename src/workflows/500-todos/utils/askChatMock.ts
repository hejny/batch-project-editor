import spaceTrim from 'spacetrim';

interface IAskChatMockOptions {
    requestText: string;
}

interface IAskChatMockReturn {
    responseText: string;
    responseHtml: string;
    metadataText: string;
}

export async function askChatMock(options: IAskChatMockOptions): Promise<IAskChatMockReturn> {
    return {
        responseText: spaceTrim(`

            import { ITakeChain } from '../interfaces/ITakeChain';
            import { Takeable } from '../interfaces/Takeable';
            import { take } from '../take';

            /**
             * Cool annotation of TakeChain
             */
            export class TakeChain<TValue extends Takeable> implements ITakeChain<TValue> {

                /**
                 * Cool annotation of TakeChain constructor
                 */
                public constructor(public value: TValue) {}

                /**
                 * Cool annotation of TakeChain then
                 */
                public then<TResultValue extends Takeable>(
                    callback: (oldValue: TValue) => TResultValue,
                ): TResultValue & ITakeChain<TResultValue> {
                    const newValue = callback(this.value);
                    return take(newValue);
                }
            }

        `),
        responseHtml: '',
        metadataText: `@see ChatMock from ${new Date().toDateString()}` /* <- TODO: Better */,
    };
}
