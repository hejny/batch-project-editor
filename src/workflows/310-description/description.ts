import markdownToTxt from 'markdown-to-txt';
import { IWorkflowOptions } from '../IWorkflow';

const DESCRIPTION_IN_MARKDOWN =
    /(?<heading>^#[^\n]*$)(\s*)((<!--Badges-->(?<badges>.*)<!--\/Badges-->)?)(\s*)(?<description>^.*?$)?(\n{2,})/ims;
export async function description({ readFile, modifyPackage, commit }: IWorkflowOptions): Promise<void> {
    const description = (await readFile('README.md')).match(DESCRIPTION_IN_MARKDOWN)?.groups?.description;

    if (!description) {
        return;
    }

    const descriptionText = markdownToTxt(description).split('\n').join(' ');

    await modifyPackage((packageJson) => {
        packageJson.description = descriptionText;
    });
    await commit('✍🏻 Description of the project into package.json');
}

// ✍🏾 ✍🏼 ✍🏿 ✍🏽 📓
