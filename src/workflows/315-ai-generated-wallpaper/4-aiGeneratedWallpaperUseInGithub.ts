import glob from 'glob-promise';
import { join } from 'path';
import { IWorkflowOptions, WorkflowResult } from '../IWorkflow';
import { clickOnText } from '../../utils/clickOnText';
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

    if (!wallpaperCurrentPath) {
        return skippingBecauseOf(`No wallpaper yet`);
    }

    const githubPage = await getGithubPage();

    await githubPage.goto(`${projectUrl}/settings`, { waitUntil: 'networkidle0' });

    (async () => {
        const fileChooser = await githubPage.waitForFileChooser();
        await fileChooser.accept([wallpaperCurrentPath]);
    })();

    await clickOnText(githubPage, 'Edit');
    await clickOnText(githubPage, 'Upload an image');

    return WorkflowResult.SideEffect;
}

aiGeneratedWallpaperUseInGithub.initialize = prepareGithubPage;
