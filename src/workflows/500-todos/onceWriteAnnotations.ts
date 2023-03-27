import chalk from 'chalk';
import spaceTrim from 'spacetrim';
import { AUTOMATED_ANNOTATION_MARK } from '../../config';
import { forPlay } from '../../utils/forPlay';
import { IWorkflowOptions, WorkflowResult } from '../IWorkflow';
import { askChatBingCached } from './utils/askChatBingCached';
import { changeAnnotationOfEntity } from './utils/changeAnnotationOfEntity';
import { normalizeAnnotation } from './utils/normalizeAnnotation';
import { parseEntities } from './utils/parseEntities';

export async function onceWriteAnnotations({
    modifyFiles,
    readJsonFile,
    modifyJsonFile,
    commit,
}: IWorkflowOptions): Promise<WorkflowResult> {
    let metadataTexts = new Set<string>();

    // TODO: Bring back whore repository not only SRC - but ignore things from .gitignore like config files
    // TODO: Bring back js,jsx files, now temporarly suspended

    await modifyFiles(
        'src/**/*.{ts,tsx}',
        //'src/**/TakeChain.ts',
        async (filePath, originalFileContent) => {
            await forPlay();

            /*
            if (basename(filePath) === 'TakeChain.ts') {
                return null;
            }
            */

            if (/\.test.\tsx?$/.test(filePath)) {
                console.info(`⏩ Skipping file ${filePath} because it is a test`);
                return null;
            }

            if (!originalFileContent.includes('@@@')) {
                console.info(
                    `⏩ Skipping file ${filePath} because it does not includes missing annotation mark @${''}@@`,
                );
                return null;
            }

            console.info(`👾 Completing annotations for ${filePath}`);

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

                Write JSDoc annotations for TypeScript code:

                ${block(fileContentEssentials)}

             `,
            );

            if (requestText.length > 1000) {
                console.info(`⏩ Skipping file ${filePath} because requestText to chat is too long`);
                return null;
            }

            let newFileContent = originalFileContent;

            const { responseText, metadataText } = await askChatBingCached(
                { requestText },
                { readJsonFile, modifyJsonFile },
            );

            metadataTexts.add(metadataText);

            // console.info({ responseText });

            const fileEntities = parseEntities(originalFileContent);
            const responseEntities = parseEntities(responseText);

            // console.info({ fileEntities, responseEntities });

            for (const fileEntity of fileEntities) {
                try {
                    console.info(`👾👾 Taking annotation of ${fileEntity.type} ${fileEntity.name}`);

                    const responseEntity = responseEntities.find(
                        (responseEntity) => responseEntity.name === fileEntity.name,
                    );

                    if (
                        !(
                            fileEntity.annotation === null ||
                            fileEntity.annotation === undefined ||
                            fileEntity.annotation?.includes('@@@') ||
                            fileEntity.annotation?.includes(AUTOMATED_ANNOTATION_MARK) ||
                            fileEntity.annotation === ''
                        )
                    ) {
                        console.info(
                            `⏩ Skipping entity ${fileEntity.name} because has complete annotation`,
                        ) /* <- TODO: !! Check if skipping only in right cases */;
                        continue;
                    }

                    if (!responseEntity) {
                        console.error({ responseEntity });
                        throw new Error(`In response there is no  ${fileEntity.type} ${fileEntity.name}`);
                    }

                    if (!responseEntity.annotation) {
                        console.error({ responseEntity });
                        throw new Error(`In response there is no annotation for ${fileEntity.type} ${fileEntity.name}`);
                    }

                    const annotation = normalizeAnnotation(responseEntity.annotation);

                    console.info(`👾👾👾👾👾👾👾👾`);
                    newFileContent = changeAnnotationOfEntity({
                        source: newFileContent,
                        entityName: fileEntity.name,
                        annotation,
                    });
                } catch (error) {
                    if (!(error instanceof Error)) {
                        throw error;
                    }

                    // !!! Regenerate the annotation here if error occures here - analyze which error are the problem
                    console.error(chalk.yellow('⚠ ' + error.message));
                }
            }

            // console.info({ originalFileContent, newFileContent });

            // TODO: Format/prettify the source code HERE (or in some next workflow)
            return newFileContent;
        },
    );

    // await forEver();

    return commit(
        spaceTrim(
            (block) => `
                💭 Write annotations

                ${block(Array.from(metadataTexts).join('\n'))}
            `,
        ),
    );
}

// onceWriteAnnotations.initialize = prepareChatBingPage;

interface IPrompt {
    requestText: string;
    responseText?: string;
    metadataText?: string;
    errors: Array<string>;
    additional: Record<string, any>;
}

/**
 * Note: To run start:
 *     > ts-node ./src/index.ts --edit --workflows onceWriteAnnotations --projects collboard --allow-dirty-cwd --branch feature/complete-annotations
 */
