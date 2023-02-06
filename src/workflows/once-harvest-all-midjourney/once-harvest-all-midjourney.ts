import chalk from 'chalk';
import { join } from 'path';
import { MIDJOURNEY_GALLERY_PATH } from '../../config';
import { stringToArrayBuffer } from '../../utils/stringToArrayBuffer';
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

    const images = await searchMidjourney({ prompt: null, version: null, isRetrying: false });

    for (const image of images) {
        for (const imageRemotePath of image.image_paths || []) {
            const imageResponse = await fetch(imageRemotePath);

            const { imageId, imageSuffix, imageExtension } = imageRemotePath.match(
                /(?<imageId>[^/]+)\/(?<imageSuffix>[^/]+)\.(?<imageExtension>[^/]+)$/,
            )!.groups!;

            const imageLocalPath = join(MIDJOURNEY_GALLERY_PATH, `${imageId}-${imageSuffix}.${imageExtension}`);
            const metaLocalPath = join(MIDJOURNEY_GALLERY_PATH, `${imageId}-${imageSuffix}.json`);

            // console.log({ imageRemotePath, imageLocalPath, imageId, imageSuffix, imageExtension });

            await writeFileWithoutOverwriting(imageLocalPath, await imageResponse.arrayBuffer(), imageRemotePath);
            await writeFileWithoutOverwriting(metaLocalPath, stringToArrayBuffer(JSON.stringify(image, null, 4)));

            console.info(chalk.green(` ⏬🖼  Downloaded ${imageId}`));
        }
    }

    return madeSideEffect(`Downloaded Midjourney gallery`);
}

/**
 * TODO: This workflow can be a separate repository on its own
 */
