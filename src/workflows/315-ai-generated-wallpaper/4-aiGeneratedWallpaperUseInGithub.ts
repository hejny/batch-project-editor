import glob from 'glob-promise';
import { join } from 'path';
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

    if (!wallpaperCurrentPath) {
        return skippingBecauseOf(`No wallpaper yet`);
    }

    const githubPage = await getGithubPage();

    githubPage.goto(`${projectUrl}/settings`);

    await githubPage.click(`.avatar-upload`);
    await githubPage.click(`label[for="repo-image-file-input"]`);

    return WorkflowResult.SideEffect;
}

aiGeneratedWallpaperUseInGithub.prepare = prepareGithubPage;
