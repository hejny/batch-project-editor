import { IWorkflowOptions, WorkflowResult } from '../IWorkflow';
import { markdownToTxtEnhanced } from './markdownToTxtEnhanced';

export const DESCRIPTION_IN_README =
    /(?<heading>^#[^\n]*$)(\s*)((<!--Badges-->(?<badges>.*)<!--\/Badges-->)?)(\s*)((<!--Wallpaper-->(?<wallpaper>.*)<!--\/Wallpaper-->)?)(\s*)(?<description>^.*?$)?(\n{2,})/ims;

export async function description({
    projectOrg,
    projectName,
    readFile,
    modifyPackage,
    commit,
    skippingBecauseOf,
}: IWorkflowOptions): Promise<WorkflowResult> {
    const description = ((await readFile('README.md')) || '').match(DESCRIPTION_IN_README)?.groups?.description;

    if (!description) {
        return skippingBecauseOf(`no description extracted from README.md`);
    }

    let descriptionText = markdownToTxtEnhanced(description).split('\n').join(' ');

    console.log({ description, descriptionText });

    descriptionText = descriptionText.split(' created via @collboard/modules-sdk.').join('');

    await modifyPackage((packageJson) => {
        packageJson.description = descriptionText;
    });
    return commit('✍🏻 Description of the project into package.json');
}

// ✍🏾 ✍🏼 ✍🏿 ✍🏽 📓
// TODO: !! Fulltext rename projectOrg to projectOwner

/**
 * TODO: [🏨] Some common config to parse readme - DESCRIPTION_IN_README
 */
