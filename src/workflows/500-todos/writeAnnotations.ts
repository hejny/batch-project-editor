import spaceTrim from 'spacetrim';
import { IWorkflowOptions, WorkflowResult } from '../IWorkflow';
import { askChatBing } from './utils/askChatBing';
import { changeAnnotationOfEntity } from './utils/changeAnnotationOfEntity';
import { prepareChatBingPage } from './utils/chatBingPage';
import { parseEntities } from './utils/parseEntities';

export async function writeAnnotations({
    modifyFiles,
    modifyJsonFile,
    commit,
}: IWorkflowOptions): Promise<WorkflowResult> {
    let commonMetadataText: null | string = null;

    await modifyFiles('**/*.{ts,tsx,js,jsx}', async (filePath, originalFileContent) => {
        // TODO: !!! Omit things like imports, empty comments / annotations , code comments, indentation,...

        const fileContentEssentials = originalFileContent
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

        const requestText = spaceTrim(
            (block) => `

                Write jsdoc annotation for source code in TypeScript:

                ${block(fileContentEssentials)}

             `,
        );

        if (requestText.length > 1000) {
            console.info(`⏩ Skipping file ${filePath} because requestText to chat is too long`);
            return null;
        }

        // !!!!! requestMultilineText vs requestText
        // !!! Limit requestText to 2000 characters

        const prompt: IPrompt = { requestText, additional: {} };

        try {
            const { responseText, metadataText, additional } = await askChatBing({ requestText });
            prompt.responseText = responseText;
            prompt.metadataText = metadataText;
            prompt.additional = { ...prompt.additional, ...additional };

            console.info({ responseText, metadataText, additional });

            const fileEntities = parseEntities(originalFileContent);
            const responseEntities = parseEntities(responseText);

            console.info({ fileEntities, responseEntities });

            prompt.additional = { ...prompt.additional, fileEntities, responseEntities };

            let newFileContent = originalFileContent;
            for (const fileEntity of fileEntities) {
                const responseEntity = responseEntities.find(
                    (responseEntity) => responseEntity.name === fileEntity.name,
                );

                if (!responseEntity) {
                    throw new Error(`Missing ${fileEntity.name} in response`);
                }

                // !!!!!!!!! Change ONLY if in original annotation is @@@ + ONLY send to chat when at least one entity has this mark
                newFileContent = changeAnnotationOfEntity({
                    source: originalFileContent,
                    entityName: fileEntity.name,
                    annotation: responseEntity.name,
                });
            }

            console.info({ originalFileContent, newFileContent });
        } catch (error) {
            if (!(error instanceof Error)) {
                throw error;
            }

            prompt.errorMessage = error.message;
        } finally {
            await modifyJsonFile<Array<{ requestText: string }>>(
                `documents/ai/prompts.json` /* <- TODO: Best place for the file + probbably use YAML */,
                (prompts) => [...(prompts || []), prompt],
            );
        }

        if (prompt.metadataText && commonMetadataText !== null && commonMetadataText !== prompt.metadataText) {
            throw new Error(
                spaceTrim(
                    (block) => `

                    There is a difference between commonMetadataText and metadataText:

                    commonMetadataText:
                    ${block(commonMetadataText!)}

                    metadataText:
                    ${block(prompt.metadataText!)}

                `,
                ),
            );
        } else if (prompt.metadataText) {
            commonMetadataText = prompt.metadataText;
        }

        return originalFileContent;
    });

    return commit(
        spaceTrim(`
            💭 Write annotations

            ${commonMetadataText}
        `), // <- TODO: More info about the chat thread, GPT version, date,...
    );
}

writeAnnotations.initialize = prepareChatBingPage;

interface IPrompt {
    requestText: string;
    responseText?: string;
    metadataText?: string;
    errorMessage?: string;
    additional: Record<string, any>;
}
