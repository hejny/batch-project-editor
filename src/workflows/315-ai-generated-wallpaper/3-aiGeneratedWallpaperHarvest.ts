import chalk from 'chalk';
import { mkdir, readFile, rmdir, writeFile } from 'fs/promises';
import { dirname, join } from 'path';
import spaceTrim from 'spacetrim';
import { execCommand } from '../../utils/execCommand/execCommand';
import { IWorkflowOptions, WorkflowResult } from '../IWorkflow';
import { searchMidjourney } from './utils/searchMidjourney/searchMidjourney';

export async function aiGeneratedWallpaperHarvest({
    projectPath,
    skippingBecauseOf,
    commit,
}: IWorkflowOptions): Promise<WorkflowResult> {
    // !!! Dry to some util
    const wallpaperPath = join(projectPath, '/assets/ai/wallpaper/');
    const wallpaperImaginePath = join(wallpaperPath, 'imagine');
    const wallpaperGalleryPath = join(wallpaperPath, 'gallery');
    const wallpaperImagineContents = await readFile(wallpaperImaginePath, 'utf8');
    const imagine = spaceTrim(wallpaperImagineContents).split('\n\n')[0].split('\n').join(' ').split('  ').join(' ');
    const imagineSentence = imagine
        .split(/--[a-zA-Z]+\s+[^\s]+\s*/g)
        .join()
        .trim();

    const searchResult = await searchMidjourney({ prompt: imagineSentence });

    if (searchResult.length === 0) {
        return skippingBecauseOf(`Nothing to harvest yet`);
    }

    // !!! This should be just temporary
    await rmdir(wallpaperGalleryPath, { recursive: true });

    const localDirs = new Set<string>();

    for (const result of searchResult) {
        for (const imageRemotePath of result.image_paths) {
            // Download image to gallery

            const imageBlob = await fetch(imageRemotePath);

            const { imageId, imageExtension } = imageRemotePath.match(
                /(?<imageId>[^/]+)\/[^/]+\.(?<imageExtension>[^/]+)$/,
            )!.groups!;
            const imageLocalPath = join(wallpaperGalleryPath, `${imageId}.${imageExtension}`);

            console.log({ imageRemotePath, imageLocalPath, imageId, imageExtension });

            await mkdir(dirname(imageLocalPath), { recursive: true });
            await writeFile(imageLocalPath, new DataView(await imageBlob.arrayBuffer()), 'binary');

            localDirs.add(dirname(imageLocalPath));

            console.info(chalk.green(`🤖🖼️🚜  ${imageLocalPath}`));
        }
    }

    for (const localDir of localDirs) {
        await execCommand({ command: `explorer ${localDir}`, crashOnError: false });
    }

    return commit(`🤖🖼️🚜 Harvesting AI–⁠generated wallpaper from the MidJourney`);
}
