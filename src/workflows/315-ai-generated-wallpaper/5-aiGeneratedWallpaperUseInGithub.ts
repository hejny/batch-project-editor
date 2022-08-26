import chalk from 'chalk';
import { stat, unlink } from 'fs/promises';
import glob from 'glob-promise';
import { join } from 'path';
import sharp from 'sharp';
import { forTime } from 'waitasecond';
import { clickOnText } from '../../utils/clickOnText';
import { IWorkflowOptions, WorkflowResult } from '../IWorkflow';
import { getGithubPage, prepareGithubPage } from './utils/githubPage';

export async function aiGeneratedWallpaperUseInGithub({
    projectPath,
    projectUrl,
    skippingBecauseOf,
}: IWorkflowOptions): Promise<WorkflowResult> {
    // !!! Dry to some util
    const wallpaperPath = join(projectPath, '/assets/ai/wallpaper/');
    const wallpaperGalleryPath = join(wallpaperPath, 'gallery');

    // TODO: !!! Choose current better than just the first
    const wallpaperCurrentPath = (await glob(join(wallpaperGalleryPath, '*.png')))[0];

    // !!!!!! Take image from README

    if (!wallpaperCurrentPath) {
        return skippingBecauseOf(`No wallpaper yet`);
    }

    const githubPage = await getGithubPage();

    await githubPage.goto(`${projectUrl}/settings`, { waitUntil: 'networkidle0' });

    /**
     * !!! Describe
     */
    let isClickedOnUpload = false;
    (async () => {
        const fileChooser = await githubPage.waitForFileChooser();

        await forTime(100);

        if (!isClickedOnUpload) {
            return;
        }

        const originalPath = wallpaperCurrentPath;
        const shrinkedPath = join(process.cwd(), '.tmp', 'shrikened.png');

        try {
            for (let k = 1; true; k = k * 0.9) {
                const width = Math.ceil(1280 * k);
                const height = Math.ceil(640 * k);

                console.info(chalk.gray(`Shrinking image to ${width}x${height}`));

                await sharp(originalPath).resize({ width, height }).png({ compressionLevel: 9 }).toFile(shrinkedPath);

                if ((await stat(shrinkedPath)).size < 1000000) {
                    break;
                }
            }

            await forTime(1000 /* To be ready to use from sharp */);
            await fileChooser.accept([shrinkedPath]);
            await forTime(1000 * 15 /* To be uploaded - to be able to unlink */);
        } finally {
            await unlink(shrinkedPath);
        }
    })();

    await clickOnText(githubPage, 'Edit');
    await clickOnText(githubPage, 'Upload an image');
    isClickedOnUpload = true;

    await forTime(1000 * 15 /* To be uploaded - to everything to settle */);

    return WorkflowResult.SideEffect;
}

aiGeneratedWallpaperUseInGithub.initialize = prepareGithubPage;
