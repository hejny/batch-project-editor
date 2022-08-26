import chalk from 'chalk';
import { spawn } from 'child_process';
import express, { Request, Response } from 'express';
import { writeFile } from 'fs/promises';
import glob from 'glob-promise';
import { locateChrome } from 'locate-app';
import { join } from 'path';
import { randomInteger } from '../../utils/random/randomInteger';
import { IWorkflowOptions, WorkflowResult } from '../IWorkflow';

export async function aiGeneratedWallpaperPick({
    projectPath,
    projectName,
    commit,
}: IWorkflowOptions): Promise<WorkflowResult> {
    // !!! Dry to some util
    const wallpaperPath = join(projectPath, '/assets/ai/wallpaper/');
    const wallpaperGalleryPath = join(wallpaperPath, 'gallery');

    const wallpaperCurrentPaths = await glob(join(wallpaperGalleryPath, '*.png'));

    const port = randomInteger(11111, 99999);
    const app = express();

    app.listen(port);

    app.get('/', (request: Request, response: Response) => {
        // !!! Timeout countdown and use skippingBecauseOf
        response.send(`


            ${wallpaperCurrentPaths.map((path) => `<a href="/pick/${path}"><img src="${path}"/></a>`).join('\n')}

        `);
    });

    const pickedWallpaperPromise = new Promise<string>((resolve) => {
        app.get('/pick/:pickedImage', (request: Request, response: Response) => {
            const pickedImage = request.param('pickedImage');
            resolve(pickedImage);
        });
    });

    const url = `http://localhost:${port}/pick`;
    spawn(await locateChrome(), [`url`]);
    console.info(chalk.bgGrey(` 👉  Pick wallpeper for ${projectName} on ${url}`));

    const pickedWallpaper = await pickedWallpaperPromise;

    console.info(chalk.bgGrey(` 👉  You have picked ${pickedWallpaper} for project ${projectName}`));

    await writeFile(join(wallpaperPath, 'current'), pickedWallpaper, 'utf8');

    return commit(`🤖🖼️👉 Pick which AI–⁠generated wallpaper to use`);
}

/**
 * TODO: Allow paralelism
 * TODO: Picking already picked project
 */
