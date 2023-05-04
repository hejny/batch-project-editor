import chalk from 'chalk';
import { writeFile } from 'fs/promises';
import { normalizeTo_snake_case } from 'n12';
import { join } from 'path';
import { MIDJOURNEY_GALLERY_PATH } from '../../config';
import { writeFileWithoutOverwriting } from '../../utils/writeFileWithoutOverwriting';
import { searchMidjourney } from '../315-ai-generated-wallpaper/utils/searchMidjourney/searchMidjourney';
import { IWorkflowOptions, WorkflowResult } from '../IWorkflow';

export async function onceHarvestAllMidjourney({
    projectName,
    madeSideEffect,
    commit,
}: IWorkflowOptions): Promise<WorkflowResult> {
    if (projectName !== 'batch-project-editor') {
        console.info(
            chalk.bgRed(`This workflow is not connected with any project and can run ONLY on batch-project-editor`),
        );
        process.exit();
    }

    const searchResult = await searchMidjourney({ prompt: null, version: null, isRetrying: false });

    for (const result of searchResult) {
        for (const imageRemotePath of result.image_paths || []) {
            const imageResponse = await fetch(imageRemotePath);

            const { imageId, imageSuffix, imageExtension } = imageRemotePath.match(
                /(?<imageId>[^/]+)\/(?<imageSuffix>[^/]+)\.(?<imageExtension>[^/]+)$/,
            )!.groups!;

            const imageNameSegment = ('Pavol_Hejn_' + normalizeTo_snake_case(result.prompt || '')).substring(0, 63);
            const imageLocalPath = join(
                MIDJOURNEY_GALLERY_PATH,
                `${imageNameSegment}_${imageId}-${imageSuffix}.${imageExtension}`,
            );
            const metaLocalPath = join(MIDJOURNEY_GALLERY_PATH, `${imageNameSegment}_${imageId}-${imageSuffix}.json`);

            // console.log({ imageRemotePath, imageLocalPath, imageId, imageSuffix, imageExtension });

            await writeFileWithoutOverwriting(imageLocalPath, await imageResponse.arrayBuffer(), imageRemotePath);

            // TODO: This produces UTF-16LE files NOT UTF-8>  await writeFileWithoutOverwriting(metaLocalPath, stringToArrayBuffer(JSON.stringify(image, null, 4)));
            await writeFile(metaLocalPath, JSON.stringify(result, null, 4) + '\n');

            console.info(chalk.green(` ⏬🖼  Downloaded ${imageId}`));
        }
    }

    return madeSideEffect(`Downloaded Midjourney gallery`);
}

/**
 * TODO: This workflow can be a separate repository on its own
 */
