import chalk from 'chalk';
import { readFile, writeFile } from 'fs/promises';
import { normalizeTo_snake_case } from '@promptbook/utils';
import { join } from 'path';
import spaceTrim from 'spacetrim';
import { writeFileWithoutOverwriting } from '../../utils/writeFileWithoutOverwriting';
import { IWorkflowOptions, WorkflowResult } from '../IWorkflow';
import { CALL_MIDJOURNEY_API_IN_SERIES, IMAGINE_VERSION } from './config';
import { IMidjourneyJob } from './utils/searchMidjourney/IMidjourneyJob';
import { searchFromDownloaded } from './utils/searchMidjourney/searchMidjourney';

export async function aiGeneratedWallpaperHarvest({
    projectPath,
    skippingBecauseOf,
    madeSideEffect,
    commit,
}: IWorkflowOptions): Promise<WorkflowResult> {
    // TODO: [🏯] Dry to some util - Use WALLPAPER_PATH + WALLPAPER_IMAGINE_PATH
    const wallpaperPath = join(projectPath, '/assets/ai/wallpaper/');
    const wallpaperImaginePath = join(wallpaperPath, 'imagine');
    const wallpaperGalleryPath = join(wallpaperPath, 'gallery');
    const wallpaperImagineContents = await readFile(
        wallpaperImaginePath,
        'utf8',
    ); /* <- TODO: !! Use here propper util from BPE workflow NOT raw absolute-path readFile */
    const imagines = spaceTrim(wallpaperImagineContents)
        .split('\r\n')
        .join('\n')
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
    // TODO: [🏯] This should be just temporary OR flagged
    if(await isDirectoryExisting(wallpaperGalleryPath)){
      await rmdir(wallpaperGalleryPath, { recursive: true });
    }
    /**/

    const searchResult: IMidjourneyJob[] = await (async () => {
        if (CALL_MIDJOURNEY_API_IN_SERIES) {
            return (
                await imagines.mapAsync(({ imagineSentence }) =>
                    searchFromDownloaded({ prompt: imagineSentence, version: IMAGINE_VERSION, isRetrying: true }),
                )
            ).flat();
        } else {
            const searchResult: IMidjourneyJob[] = [];
            for (const { imagineSentence } of imagines) {
                searchResult.push(
                    ...(await searchFromDownloaded({
                        prompt: imagineSentence,
                        version: IMAGINE_VERSION,
                        isRetrying: true,
                    })),
                );
            }
            return searchResult;
        }
    })();

    if (searchResult.length === 0) {
        return skippingBecauseOf(`nothing to harvest yet`);
    }

    const localDirs = new Set<string>();

    for (const result of searchResult) {
        for (const imageRemotePath of result.image_paths || []) {
            // Download image to gallery

            console.info(chalk.blue(` ⏬  Downloading ${imageRemotePath}`));

            const imageResponse = await fetch(imageRemotePath);

            const { imageId, imageSuffix, imageExtension } = imageRemotePath.match(
                /(?<imageId>[^/]+)\/(?<imageSuffix>[^/]+)\.(?<imageExtension>[^/]+)$/,
            )!.groups!;

            const imageNameSegment = ('Pavol_Hejn_' + normalizeTo_snake_case(result.prompt)).substring(0, 63);
            const imageLocalPath = join(
                wallpaperGalleryPath,
                `${imageNameSegment}_${imageId}-${imageSuffix}.${imageExtension}`,
            );
            const metaLocalPath = join(wallpaperGalleryPath, `${imageNameSegment}_${imageId}-${imageSuffix}.json`);

            // console.log({ imageRemotePath, imageLocalPath, imageId, imageSuffix, imageExtension });

            await writeFileWithoutOverwriting(imageLocalPath, await imageResponse.arrayBuffer(), imageRemotePath);

            // TODO: This produces UTF-16LE files NOT UTF-8> await writeFileWithoutOverwriting(metaLocalPath, stringToArrayBuffer(JSON.stringify(result, null, 4)));
            await writeFile(metaLocalPath, JSON.stringify(result, null, 4) + '\n');

            localDirs.add(wallpaperGalleryPath);
            console.info(chalk.green(`🤖🖼️🚜  ${imageLocalPath}`));
        }
    }

    /*/
   // TODO: [🏯] Allow this by some CLI flag
    for (const localDir of localDirs) {
        // TODO: [🏯] Use openFolder
        await execCommand({ command: `explorer ${localDir}`, crashOnError: false });
    }
    /**/

    return madeSideEffect(`🤖🖼️🚜 Harvesting AI–⁠generated wallpaper from the MidJourney`);
    // !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!> return commit(`🤖🖼️🚜 Harvesting AI–⁠generated wallpaper from the MidJourney`);
}

/**
 * TODO: Maybe create util writeFileWithoutOverwriting
 */
