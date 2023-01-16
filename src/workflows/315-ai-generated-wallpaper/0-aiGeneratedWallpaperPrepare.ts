import chalk from 'chalk';
import { mkdir } from 'fs/promises';
import { join } from 'path';
import spaceTrim from 'spacetrim';
import { createAllSubsetsOf } from '../../utils/createAllSubsetsOf';
import { IWorkflowOptions, WorkflowResult } from '../IWorkflow';
import { IMAGINE_OPTIONAL_FLAGS, IMAGINE_REQUIRED_FLAGS, IMAGINE_TEMPLATES } from './config';
import { stripsLinks } from './utils/stripsLinks';

export async function aiGeneratedWallpaperPrepare({
    packageJson,
    projectPath,
    commit,
    skippingBecauseOf,
    modifyFile,
}: IWorkflowOptions): Promise<WorkflowResult> {
    // TODO: Detect manual change and if than do not regenerate
    //       @see https://stackoverflow.com/questions/3701404/how-to-list-all-commits-that-changed-a-specific-file

    if (!packageJson.description) {
        return skippingBecauseOf(`no description in package.json`);
    }

    // TODO: [🏯] Dry to some util
    const wallpaperPath = join(projectPath, '/assets/ai/wallpaper/');
    const wallpaperImaginePath = join(wallpaperPath, 'imagine');

    let descriptionSentence = packageJson.description;

    // TODO: !!! Following should be in config:
    descriptionSentence = descriptionSentence.replace(/Collboard(.com)?/i, 'virtual online whiteboard');
    descriptionSentence = descriptionSentence.replace('See all file support modules for Collboard', '');
    descriptionSentence = stripsLinks(descriptionSentence);

    // TODO: !!! Trim descriptionSentence + trim also .

    // const imagineFlagsSeed = `--seed ${randomInteger(1111111, 9999999)}`;

    const wallpaperImagineContents: string[] = [];
    for (const imagineOptionalFlags of createAllSubsetsOf(...IMAGINE_OPTIONAL_FLAGS)) {
        for (const imagineTemplate of IMAGINE_TEMPLATES) {
            const imagineSentence = imagineTemplate.replace('%', descriptionSentence);
            wallpaperImagineContents.push(
                spaceTrim(
                    (block) => `
                        ${block(imagineSentence)}
                        ${block([...IMAGINE_REQUIRED_FLAGS, ...imagineOptionalFlags].join(' '))}
                        ${/*block(imagineFlagsSeed)*/ ''}
                    `,
                )
                    .split('\n\n')
                    .join('\n'),
            );
        }
    }

    console.log(chalk.gray(`Creating folder ${wallpaperPath.split('\\').join('/')}`));
    await mkdir(wallpaperPath, { recursive: true });

    await modifyFile(wallpaperImaginePath, () =>
        spaceTrim(
            (block) => `
            # Note: Each part is new input for imagine command
            #       And every first line will be searched during the harvesting phase

            ${block(wallpaperImagineContents.join('\n\n'))}

        `,
        ),
    );

    return commit(`🤖🖼️ AI–⁠generated wallpaper prepare imagine entry`);

    // TODO: [🏯] Implement
    // /assets/ai/wallpaper/current
}

/**
 * Note: All important AI TODOs are marked with [🏯]
 * TODO: Maybe there should be /assets/ai/wallpaper/README.md # AI–⁠generated Wallpaper
 */
