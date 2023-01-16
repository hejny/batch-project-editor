import chalk from 'chalk';
import { spawn } from 'child_process';
import express, { Request, Response } from 'express';
import { readFile, unlink, writeFile } from 'fs/promises';
import glob from 'glob-promise';
import { locateChrome } from 'locate-app';
import { join, relative } from 'path';
import serveStatic from 'serve-static';
import sharp from 'sharp';
import { openFolder } from '../../utils/execCommand/openFolder';
import { isFileExisting } from '../../utils/isFileExisting';
import { randomInteger } from '../../utils/random/randomInteger';
import { IWorkflowOptions, WorkflowResult } from '../IWorkflow';
import { getMidjourneyLink } from './utils/getMidjourneyLink';

export async function aiGeneratedWallpaperPick({
    projectPath,
    projectUrl,
    projectTitle,
    projectName,
    commit,
    skippingBecauseOf,
}: IWorkflowOptions): Promise<WorkflowResult> {
    // TODO: [🏯] Dry to some util
    const wallpaperPath = join(projectPath, '/assets/ai/wallpaper/');
    const wallpaperGalleryPath = join(wallpaperPath, 'gallery');
    const wallpaperCurrentPointerPath = join(wallpaperPath, 'current');
    const wallpaperCurrentPath = !(await isFileExisting(wallpaperCurrentPointerPath))
        ? null
        : join(wallpaperGalleryPath, await readFile(wallpaperCurrentPointerPath, 'utf8'))
              .split('\\')
              .join('/');
    const allWallpapersPaths = await glob(join(wallpaperGalleryPath, '*.png'));

    if (allWallpapersPaths.length === 0) {
        return skippingBecauseOf('no images to pick');
    }

    const port = randomInteger(11111, 65536);
    const app = express();

    const server = app.listen(port);

    app.use('/gallery', serveStatic(wallpaperGalleryPath));
    app.use('/open-folder', async (request: Request, response: Response) => {
        await openFolder(wallpaperGalleryPath);
        return response.send(`
            Opened!
        `);
    });
    app.get('/', async (request: Request, response: Response) => {
        // TODO: [🏯] Timeout countdown and use skippingBecauseOf
        return response.send(`

            <h1>${projectTitle}</h1>

            <ul>
              <li><a href="/open-folder" target="_blank">Open folder</a></li>
              <li><a href="${projectUrl}" target="_blank">Open on GitHub</a></li>
              <li><a href="${projectUrl}/edit/main/README.md target="_blank">Edit README.md</a></li>
              <li><a href="${projectUrl}/edit/main/assets/ai/wallpaper/imagine" target="_blank">Edit imagine</a> + you need to add <i># @batch-project-editor ignore</i> line there.</li>
            </ul>

            <i>
            <ul>
              <li>Note: If there is no good looking image, edit projects README or imagine file and change description to some better /imagine and pick none at the bottom.</li>
              ${
                  !wallpaperCurrentPath
                      ? ``
                      : `<li>Note: To preserve your pick just select the highlited first image.</li>`
              }
            </ul>
            </i>

            <div id="gallery">
                ${(
                    await allWallpapersPaths.mapAsync(async (absolutePath) => {
                        const { width, height } = await sharp(absolutePath).metadata();
                        const isPicked = absolutePath === wallpaperCurrentPath;
                        const isThumbnail = (width || 0) <= 512;

                        const classes: string[] = ['item'];
                        if (isPicked) {
                            classes.push('picked');
                        }
                        if (isThumbnail) {
                            classes.push('thumbnail');
                        }

                        return {
                            absolutePath,
                            relativePath: relative(wallpaperGalleryPath, absolutePath),
                            width: width || 0,
                            height: height || 0,
                            isPicked,
                            isThumbnail,
                            classes,
                        };
                    })
                )
                    .sort((a, b) => (a.width < b.width ? 1 : -1))
                    .map(({ absolutePath, relativePath, width, height, isPicked, isThumbnail, classes }) => {
                        return `
                                <div class="${classes.join(' ')}">
                                    <div class="image-label"><div class="inner">
                                        ${width < 1920 || height < 1080 ? `⚠` : `✅`} ${width}x${height}

                                        <a target="_blank" href="${getMidjourneyLink(relativePath)}">
                                        🔗MidJourney
                                        </a>
                                    </div></div>
                                    <a class="image" href="/pick/${relativePath}">
                                      <img src="/gallery/${relativePath}"/>
                                    </a>
                                    <!--${JSON.stringify({
                                        absolutePath,
                                        relativePath,
                                        width,
                                        height,
                                        isPicked,
                                        isThumbnail,
                                        classes,
                                    })}-->
                                </div>
                            `;
                    })
                    .join('\n')}

                <a href="/pick/none" class="item none">Choose none</a>
            </div>


            <style>

                html,
                body {
                    padding: 0;
                    margin: 0;
                }

                #gallery {
                    display: flex;
                    flex-wrap: wrap;
                    align-items: stretch;
                    padding: 0;
                    margin: 0;
                    margin-top: 20px;
                    font-size: 0;
                }

                #gallery > .item {
                    outline: 1px solid black;
                    display: block;
                    width: calc(33.33% - 5px);
                }

                #gallery a,
                #gallery a:link,
                #gallery a:visited {
                  color: inherit;
                  text-decoration: inherit;
                }

                #gallery > .item > a.image {
                  display: block;
                  width: 100%;
                  height: 100%;
                  overflow: hidden;
                }

                #gallery > .item > a.image > img {
                    width: 100%;
                }

                #gallery > .item > .image-label {
                    display: inline;
                    z-index: 100;
                    position: relative;

                }

                #gallery > .item > .image-label > .inner {
                    display: inline;
                    position: absolute;
                    margin: 20px;
                    font-size: 16px;
                    text-shadow: 1px 1px 2px black;
                    color: white;
                }

                .thumbnail {
                    opacity: 0.5;
                }

                .picked {
                    z-index: 2;
                    order: -1;
                    outline: 5px solid #ff1152 !important;
                    box-shadow: #5011ff 0 0 15px;
                }

                #gallery > .none {
                  font-size: 16px !important;
                  background-color: #66ccff;
                  aspect-ratio: 3/2;
                  display: flex;
                  justify-content: center;
                  align-items: center;
                }

            </style>

        `);
    });

    const pickedWallpaperPromise = new Promise<string | null>((resolve) => {
        app.get('/pick/:pickedImage', (request: Request, response: Response) => {
            const pickedImage = request.param('pickedImage');

            if (pickedImage !== 'none') {
                resolve(pickedImage);
            } else {
                resolve(null);
            }

            return response.send(`
                Picked!
            `);

            /*
            TODO: There should be some mechanism to auto-close window after the picking
            >  return response.send(`
            >      <script>
            >        window.close();
            >      </script>
            >  `);
            */
        });
    });

    const url = `http://localhost:${port}`;
    spawn(await locateChrome(), [url]);
    console.info(chalk.bgGrey(` 👉  Pick wallpeper for ${projectName} on ${url}`));

    const pickedWallpaper = await pickedWallpaperPromise;

    server.close(/* TODO: Maybe some mechanism how to recycle server */);

    if (pickedWallpaper !== null) {
        console.info(chalk.bgGrey(` 👉  You have picked ${pickedWallpaper} for project ${projectName}`));
        // Note: Here should be really used writeFile not modifyFile
        await writeFile(wallpaperCurrentPointerPath, pickedWallpaper, 'utf8');
    } else {
        console.info(chalk.bgGrey(` 👉  You have unpicked wallpaper for project ${projectName}`));
        if (await isFileExisting(wallpaperCurrentPointerPath)) {
            await unlink(wallpaperCurrentPointerPath);
        }
    }

    return commit(`🤖🖼️👉 Pick which AI–⁠generated wallpaper to use`);
}

/**
 * TODO: Allow paralelism
 * TODO: Picking already picked project
 * TODO: Support for multiple wallpapers to be picked
 */
