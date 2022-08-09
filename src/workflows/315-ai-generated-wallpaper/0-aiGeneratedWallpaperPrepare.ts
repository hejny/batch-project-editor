import { mkdir, writeFile } from 'fs/promises';
import { join } from 'path';
import spaceTrim from 'spacetrim';
import { randomInteger } from '../../utils/random/randomInteger';
import { IWorkflowOptions, WorkflowResult } from '../IWorkflow';

export async function aiGeneratedWallpaperPrepare({
    packageJson,
    projectPath,
    commit,
    skippingBecauseOf,
}: IWorkflowOptions): Promise<WorkflowResult> {
    // !!! Detect manual change and if than do not regenerate

    if (!packageJson.description) {
        return skippingBecauseOf(`no description in package.json`);
    }

    const wallpaperPath = join(projectPath, '/assets/ai/wallpaper/');

    const imagineSentence = packageJson.description.replace(/Collboard(.com)?/i, 'virtual online whiteboard');

    const imagineFlags = `--aspect 2:1  --quality 2 --stylize 1250 --version 3`; /* <- Note: Default flags to config */ /* <- Note: [🎏] More on flags here */
    const imagineFlagsSeed = `--seed ${randomInteger(1111111, 9999999)}`;

    await mkdir(wallpaperPath, { recursive: true });
    await writeFile(
        join(wallpaperPath, 'imagine'),
        spaceTrim(`

            ${imagineSentence}
            ${imagineFlags}
            ${imagineFlagsSeed}

            Note: All lines bellow (including this) are ignored.

        `),
        'utf8',
    );

    return commit(`🤖🖼️ AI generated wallpaper prepare imagine entry`);

    // TODO: !!! Implement
    // /assets/ai/wallpaper/current
    // /assets/ai/wallpaper/imagine
    // /assets/ai/wallpaper/gallery/sgfsfsdf.png
}

/**
 * TODO: Maybe there should be /assets/ai/wallpaper/README.md # AI Generated Wallpaper
 */
