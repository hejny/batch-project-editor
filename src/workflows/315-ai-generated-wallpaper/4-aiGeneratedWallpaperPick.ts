import chalk from 'chalk';
import { spawn } from 'child_process';
import express, { Request, Response } from 'express';
import { unlink, writeFile } from 'fs/promises';
import glob from 'glob-promise';
import { locateChrome } from 'locate-app';
import { join, relative } from 'path';
import serveStatic from 'serve-static';
import sharp from 'sharp';
import { isFileExisting } from '../../utils/isFileExisting';
import { IWorkflowOptions, WorkflowResult } from '../IWorkflow';

export async function aiGeneratedWallpaperPick({
    projectPath,
    projectName,
    commit,
}: IWorkflowOptions): Promise<WorkflowResult> {
    // !!! Dry to some util
    const wallpaperPath = join(projectPath, '/assets/ai/wallpaper/');
    const wallpaperGalleryPath = join(wallpaperPath, 'gallery');
    const wallpaperCurrentPointerPath = join(wallpaperPath, 'current');

    const wallpaperCurrentPaths = await glob(join(wallpaperGalleryPath, '*.png'));

    const port = 57704; // TODO: [0]> randomInteger(11111, 99999);
    const app = express();

    app.listen(port);

    app.use('/gallery', serveStatic(wallpaperGalleryPath));
    app.get('/', async (request: Request, response: Response) => {
        // !!! Timeout countdown and use skippingBecauseOf
        return response.send(`

            <div id="gallery">
                ${(
                    await wallpaperCurrentPaths
                        .map((absolutePath) => ({
                            absolutePath,
                            relativePath: relative(wallpaperGalleryPath, absolutePath),
                        }))
                        .mapAsync(
                            async ({ absolutePath, relativePath }) => `
                                <a href="/pick/${relativePath}">
                                    <img src="/gallery/${relativePath}" class="${await sharp(absolutePath)
                                .metadata()
                                .then(({ width, height }) => `width-${width} height-${height}`)}"/>
                                </a>
                            `,
                        )
                ).join('\n')}

                <a href="/pick/none">Choose none</a>
            </div>


          <style>

              html,body {
                padding: 0;
                margin: 0;
              }

              #gallery {
                display: block;
                padding: 0;
                margin: 0;
              }


              #gallery img {
                width: calc(20% - 5px);
              }

              img.width-512{
                opacity: 0.5;
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

    if (pickedWallpaper !== null) {
        console.info(chalk.bgGrey(` 👉  You have picked ${pickedWallpaper} for project ${projectName}`));
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
 * TODO: [0] Allow paralelism
 * TODO: Picking already picked project
 * TODO: Support for multiple wallpapers to be picked
 */
