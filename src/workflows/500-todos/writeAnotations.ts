import spaceTrim from 'spacetrim';
import { IWorkflowOptions, WorkflowResult } from '../IWorkflow';
import { IEntity, IEntityType } from './interfaces/entity';
import { askChatBing } from './utils/askChatBing';
import { prepareChatBingPage } from './utils/chatBingPage';

export async function writeAnotations({
    modifyFiles,
    modifyJsonFile,
    commit,
}: IWorkflowOptions): Promise<WorkflowResult> {
    let commonMetadataText: null | string = null;

    await modifyFiles('**/*.{ts,tsx,js,jsx}', async (filePath, fileContent) => {
        if (fileContent.split('@@@').length - 1 !== 1) {
            // TODO: !!! Make this script work with multiple anotations / entities per file
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
            .join('')
            .split('export ')
            .join('');

        /*
        console.log('---------------------------------');
        console.log(fileContent);
        console.log('---------------------------------');
        console.log(fileContentEssentials);
        console.log('---------------------------------');
        */

        const fileEntities: Array<IEntity> = [];
        for (const match of fileContent.matchAll(
            // TODO: !!!!!!!!!!!!!! Also detect non-export entities
            /(?<anotation>\/\*\*((?!\/\*\*).)*?\*\/\s*)?export(?:\s+declare)?(?:\s+abstract)?(?:\s+async)?(?:\s+(?<type>[a-z]+))(?:\s+(?<name>[a-zA-Z0-9_]+))/gs,
        )) {
            const { type, name, anotation } = match.groups!;

            const tags = Array.from(anotation?.match(/@([a-zA-Z0-9_-]+)*/g) || []);
            fileEntities.push({ type: type as IEntityType, name, anotation, tags });
        }

        if (fileEntities.length !== 1) {
            // TODO: !!! Make this script work with multiple anotations / entities per file
            console.info(`⬜ File ${filePath} has none or multiple entities `);
            return null;
        }

        const [entity] = fileEntities;

        const requestText = spaceTrim(
            (block) => `

                Write jsdoc anotation for ${entity.type} ${entity.name}:

                ${block(fileContentEssentials)}

             `,
        );

        // !!!!! requestMultilineText vs requestText
        // !!! Limit requestText to 2000 characters

        const { responseText, metadataText, additional } = await askChatBing({ requestText });

        fileContent = fileContent.split('@@@').join(responseText.split('\n').join(' '));

        await modifyJsonFile<Array<{ requestText: string; responseText: string }>>(
            `documents/ai/prompts.json` /* <- TODO: Best place for the file + probbably use YAML */,
            (promptsContent) => [...(promptsContent || []), { requestText, responseText, additional }],
        );

        if (commonMetadataText !== null && commonMetadataText !== metadataText) {
            throw new Error(
                spaceTrim(
                    (block) => `

                        There is a difference between commonMetadataText and metadataText:

                        commonMetadataText:
                        ${block(commonMetadataText!)}

                        metadataText:
                        ${block(metadataText)}

                    `,
                ),
            );
        }

        commonMetadataText = metadataText;

        return fileContent;
    });

    return commit(
        spaceTrim(`
            💭 Write anotations

            ${commonMetadataText}
        `), // <- TODO: More info about the chat thread, GPT version, date,...
    );
}

writeAnotations.initialize = prepareChatBingPage;
