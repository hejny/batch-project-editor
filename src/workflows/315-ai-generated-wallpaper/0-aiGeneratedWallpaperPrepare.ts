import chalk from 'chalk';
import { mkdir } from 'fs/promises';
import { join } from 'path';
import spaceTrim from 'spacetrim';
import { createAllSubsetsOf } from '../../utils/createAllSubsetsOf';
import { IWorkflowOptions, WorkflowResult } from '../IWorkflow';
import { IMAGINE_OPTIONAL_FLAGS, IMAGINE_REQUIRED_FLAGS, IMAGINE_TEMPLATES } from './config';
import { stripsLinks } from './utils/stripsLinks';

const WALLPAPER_PATH = '/assets/ai/wallpaper/';
const WALLPAPER_IMAGINE_PATH = WALLPAPER_PATH + 'imagine';

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

    let descriptionSentence = packageJson.description;

    // TODO: !! Following should be in config NOT hardcoded:
    descriptionSentence = descriptionSentence.replace(/Collboard(.com)?/i, 'virtual online whiteboard');
    descriptionSentence = descriptionSentence.replace('See all file support modules for Collboard', '');
    descriptionSentence = stripsLinks(descriptionSentence);

    // TODO: !! Trim descriptionSentence + trim also .

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

    console.log(chalk.gray(`Creating folder ${WALLPAPER_PATH.split('\\').join('/')}`));
    await mkdir(join(projectPath, WALLPAPER_PATH), {
        recursive: true,
    }) /* <- TODO: !! modifyFile should automatically make recursive dir for you */;

    await modifyFile(WALLPAPER_IMAGINE_PATH, () =>
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
