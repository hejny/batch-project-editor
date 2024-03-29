import chalk from 'chalk';
import { readFile, stat, unlink } from 'fs/promises';
import { join } from 'path';
import sharp from 'sharp';
import { forTime } from 'waitasecond';
import { clickOnText } from '../../utils/clickOnText';
import { forPlay } from '../../utils/forPlay';
import { isFileExisting } from '../../utils/isFileExisting';
import { IWorkflowOptions, WorkflowResult } from '../IWorkflow';
import { WALLPAPER_IN_README } from './5-aiGeneratedWallpaperUseInReadme';
import { getGithubPage, prepareGithubPage } from './utils/githubPage';

export async function aiGeneratedWallpaperUseInGithub({
    projectPath,
    projectUrl,
    skippingBecauseOf,
    madeSideEffect,
}: IWorkflowOptions): Promise<WorkflowResult> {
    const readmeContent = await readFile(join(projectPath, `README.md`), 'utf8');
    const match1 = WALLPAPER_IN_README.exec(readmeContent);

    if (!match1) {
        return skippingBecauseOf(`no wallpaper in README.md yet`);
    }

    const match2 = /\!\[[^\]]+\]\((?<imageSrc>[^\)]+)\)/.exec(match1[0]);

    if (!match2) {
        throw new Error(`No wallpaper in README.md wallpaper section`);
    }

    const wallpaperSrc = match2?.groups?.imageSrc;

    if (!wallpaperSrc) {
        throw new Error(`Corrupted wallpaper in README.md wallpaper section`);
    }

    const wallpaperPath = join(projectPath, wallpaperSrc);

    if (!(await isFileExisting(wallpaperPath))) {
        throw new Error(`Wallpaper in README.md do not exist`);
    }

    const githubPage = await getGithubPage();

    await githubPage.goto(`${projectUrl}/settings`, { waitUntil: 'networkidle0' });

    /**
     * [🏯] Describe
     */
    let isClickedOnUpload = false;
    (async () => {
        const fileChooser =
            await githubPage.waitForFileChooser(/* TODO: Here is often TimeoutError: waiting for waiting for file chooser failed: timeout 30000ms exceeded */);

        await forTime(100);

        if (!isClickedOnUpload) {
            return;
        }

        const originalPath = wallpaperPath;
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
            console.info(chalk.gray(`⏳ Waiting for 15 seconds to file to be uploaded`));
            await forTime(1000 * 15 /* To be uploaded - to be able to unlink */);
            await forPlay();
        } finally {
            await unlink(shrinkedPath);
        }
    })();

    await clickOnText(githubPage, 'Edit');
    await clickOnText(githubPage, 'Upload an image');
    isClickedOnUpload = true;

    console.info(chalk.gray(`⏳ Waiting for 15 seconds to everything to settle`));
    await forTime(1000 * 15 /* To be uploaded - to everything to settle */);
    await forPlay();

    return madeSideEffect(`Changed social media banner image in Github repository settings`);
}

aiGeneratedWallpaperUseInGithub.initialize = prepareGithubPage;
