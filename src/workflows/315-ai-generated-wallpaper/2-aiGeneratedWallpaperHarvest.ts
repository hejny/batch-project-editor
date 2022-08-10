import { mkdir, readFile, writeFile } from 'fs/promises';
import { dirname, join } from 'path';
import spaceTrim from 'spacetrim';
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

    for (const result of searchResult) {
        for (const imageRemotePath of result.image_paths) {
            // Download image to gallery

            const imageBlob = await fetch(imageRemotePath);

            const imageLocalPath = join(wallpaperGalleryPath, imageRemotePath.match(/[^/]+\/[^/]+$/)![0]);
            await mkdir(dirname(imageLocalPath), { recursive: true });
            await writeFile(imageLocalPath, new DataView(await imageBlob.arrayBuffer()), 'binary');
        }
    }

    return commit(`🤖🖼️🌽 Harvesting AI–⁠generated wallpaper from the MidJourney`);
}
