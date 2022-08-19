import chalk from 'chalk';
import { mkdir, readFile, writeFile } from 'fs/promises';
import { dirname, join } from 'path';
import spaceTrim from 'spacetrim';
import { execCommand } from '../../utils/execCommand/execCommand';
import { isFileExisting } from '../../utils/isFileExisting';
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
    const imagines = spaceTrim(wallpaperImagineContents)
        .split('\n\n')
        .map((row) => row.split('\n').join(' ').split('  ').join(' ').trim())
        .filter((row) => row !== '' && !row.startsWith('#'))
        .map((imagineSentenceWithFlags) => ({
            imagineSentenceWithFlags,
            imagineSentence: imagineSentenceWithFlags
                .split(/--[a-zA-Z]+\s+[^\s]+\s*/g)
                .join('')
                .trim(),
        }));

    /*/
    // !!! This should be just temporary OR flagged
    if(await isDirectoryExisting(wallpaperGalleryPath)){
      await rmdir(wallpaperGalleryPath, { recursive: true });
    }
    /**/

    const searchResult = (
        await imagines.mapAsync(({ imagineSentence }) => searchMidjourney({ prompt: imagineSentence }))
    ).flat();

    if (searchResult.length === 0) {
        return skippingBecauseOf(`Nothing to harvest yet`);
    }

    const localDirs = new Set<string>();

    for (const result of searchResult) {
        for (const imageRemotePath of result.image_paths) {
            // Download image to gallery

            const imageResponse = await fetch(imageRemotePath);

            const { imageId, imageSuffix, imageExtension } = imageRemotePath.match(
                /(?<imageId>[^/]+)\/(?<imageSuffix>[^/]+)\.(?<imageExtension>[^/]+)$/,
            )!.groups!;
            const imageLocalPath = join(wallpaperGalleryPath, `${imageId}-${imageSuffix}.${imageExtension}`);

            // console.log({ imageRemotePath, imageLocalPath, imageId, imageSuffix, imageExtension });

            // [🖼️] Note: Check if file already exists...
            if (!(await isFileExisting(imageLocalPath))) {
                // [🖼️❌] Note: ... if it does not, make folder for it and just simply save
                await mkdir(dirname(imageLocalPath), { recursive: true });
                await writeFile(imageLocalPath, new DataView(await imageResponse.arrayBuffer()), 'binary');
            } else {
                // [🖼️✔️] Note: ... if it does, compare the existing file with downloaded one ...

                const imageLocalContentsHex = await readFile(imageLocalPath, 'hex');
                const imageDownloadedContentsHex = buf2hex(await imageResponse.arrayBuffer());

                if (imageLocalContentsHex !== imageDownloadedContentsHex) {
                    // TODO: !!!!!!!! This error should not occur on any project - TODO: Make some warning mechanism
                    console.error(
                        chalk.bgRed(
                            spaceTrim(`
                                Files which should be identical are different:

                                ${imageLocalPath}
                                ${imageLocalContentsHex.substring(0, 100)}...

                                vs.

                                ${imageRemotePath}
                                ${imageDownloadedContentsHex.substring(0, 100)}...

                            `),
                        ),
                    );
                }
            }

            localDirs.add(dirname(imageLocalPath));

            console.info(chalk.green(`🤖🖼️🚜  ${imageLocalPath}`));
        }
    }

    for (const localDir of localDirs) {
        await execCommand({ command: `explorer ${localDir}`, crashOnError: false });
    }

    return commit(`🤖🖼️🚜 Harvesting AI–⁠generated wallpaper from the MidJourney`);
}

function buf2hex(buffer: any): any {
    // buffer is an ArrayBuffer
    return [...new Uint8Array(buffer)].map((x) => x.toString(16).padStart(2, '0')).join('');
}

/**
 * TODO: Maybe create util writeFileWithoutOverwriting
 */
