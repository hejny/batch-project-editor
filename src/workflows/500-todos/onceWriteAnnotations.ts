import spaceTrim from 'spacetrim';
import { IWorkflowOptions, WorkflowResult } from '../IWorkflow';
import { askChatBing } from './utils/askChatBing';
import { changeAnnotationOfEntity } from './utils/changeAnnotationOfEntity';
import { prepareChatBingPage } from './utils/chatBingPage';
import { parseEntities } from './utils/parseEntities';

export async function onceWriteAnnotations({
    modifyFiles,
    modifyJsonFile,
    commit,
}: IWorkflowOptions): Promise<WorkflowResult> {
    let commonMetadataText: null | string = null;

    // TODO: Bring back whore repository not only SRC - but ignore things from .gitignore like config files
    // TODO: Bring back js,jsx files, now temporarly suspended

    await modifyFiles('src/**/*.{ts,tsx}', async (filePath, originalFileContent) => {
        if (/\.test.\tsx?$/.test(filePath)) {
            console.info(`⏩ Skipping file ${filePath} because it is a test`);
            return null;
        }

        if (!originalFileContent.includes('@@@')) {
            console.info(`⏩ Skipping file ${filePath} because it does not includes missing annotation mark @${''}@@`);
            return null;
        }

        // TODO: Omit things like imports, empty comments / annotations , code comments, indentation,...
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

        let newFileContent = originalFileContent;

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

            for (const fileEntity of fileEntities) {
                const responseEntity = responseEntities.find(
                    (responseEntity) => responseEntity.name === fileEntity.name,
                );

                if (!(fileEntity.annotation === '@@@' || fileEntity.annotation === '')) {
                    console.info(
                        `⏩ Skipping entity ${fileEntity.name} because has complete annotation`,
                    ) /* <- TODO: !!! Check if skipping only in right cases */;
                    continue;
                }

                if (!responseEntity) {
                    console.error({ responseEntity });
                    throw new Error(`Missing ${fileEntity.name} in response`);
                }

                if (!responseEntity.annotation) {
                    console.error({ responseEntity });
                    throw new Error(`Missing annotation in ${fileEntity.name} from response`);
                }

                newFileContent = changeAnnotationOfEntity({
                    source: originalFileContent,
                    entityName: fileEntity.name,
                    annotation: responseEntity.annotation,
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

        // TODO: Format/prettify the source code HERE (or in some next workflow)
        return newFileContent;
    });

    return commit(
        spaceTrim(`
            💭 Write annotations

            ${commonMetadataText}
        `), // <- TODO: More info about the chat thread, GPT version, date,...
    );
}

onceWriteAnnotations.initialize = prepareChatBingPage;

interface IPrompt {
    requestText: string;
    responseText?: string;
    metadataText?: string;
    errorMessage?: string;
    additional: Record<string, any>;
}

/**
 * TODO: requestMultilineText vs requestText
 * Note: To run start:
 *     > ts-node ./src/index.ts --edit --workflows onceWriteAnnotations --projects collboard --allow-dirty-cwd --branch feature/complete-annotations/index.ts
 */

