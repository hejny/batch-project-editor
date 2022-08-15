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
    // TODO: Detect manual change and if than do not regenerate
    //       @see https://stackoverflow.com/questions/3701404/how-to-list-all-commits-that-changed-a-specific-file

    if (!packageJson.description) {
        return skippingBecauseOf(`no description in package.json`);
    }

    // !!! Dry to some util
    const wallpaperPath = join(projectPath, '/assets/ai/wallpaper/');
    const wallpaperImaginePath = join(wallpaperPath, 'imagine');

    const descriptionSentence = packageJson.description.replace(/Collboard(.com)?/i, 'virtual online whiteboard');

    // !!! const imagineSentencePrefix =

    // Note: Maybe some prefix/suffix; Pick one of (or implement multiple):
    const imagineSentence = descriptionSentence;
    // const imagineSentence = `Banner for ${descriptionSentence}`;
    // const imagineSentence = `Wallpaper in minimalistic style for project that ${descriptionSentence}`;

    // !!!! Maybe use: --aspect 2:1 --version 3 --quality 2 --stylize 1250
    const imagineFlags = `--wallpaper`; /* <- Note: Default flags to config */ /* <- Note: [🎏] More on flags here */
    const imagineFlagsSeed = `--seed ${randomInteger(1111111, 9999999)}`;

    // !!! Remove
    console.log('/imagine ', imagineSentence);

    await mkdir(wallpaperPath, { recursive: true });
    await writeFile(
        wallpaperImaginePath,
        spaceTrim(`
            ${imagineSentence}
            ${imagineFlags}
            ${imagineFlagsSeed}

            Note: All lines bellow (including this) are ignored.

        `),
        'utf8',
    );

    return commit(`🤖🖼️ AI–⁠generated wallpaper prepare imagine entry`);

    // TODO: !!! Implement
    // /assets/ai/wallpaper/current
    // /assets/ai/wallpaper/imagine
    // /assets/ai/wallpaper/gallery/sgfsfsdf.png
}

/**
 * TODO: Maybe there should be /assets/ai/wallpaper/README.md # AI–⁠generated Wallpaper
 */
