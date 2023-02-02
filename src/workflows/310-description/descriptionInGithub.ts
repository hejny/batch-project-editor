import { clickOnText } from '../../utils/clickOnText';
import { getGithubPage, prepareGithubPage } from '../315-ai-generated-wallpaper/utils/githubPage';
import { IWorkflowOptions, WorkflowResult } from '../IWorkflow';

export async function descriptionInGithub({
    packageJson,
    skippingBecauseOf,
    madeSideEffect,
    projectUrl,
}: IWorkflowOptions): Promise<WorkflowResult> {
    const newDescription = packageJson.description;

    if (!newDescription) {
        return skippingBecauseOf(`no description extracted from README.md`);
    }

    const githubPage = await getGithubPage();

    await githubPage.goto(`${projectUrl}`, { waitUntil: 'networkidle0' });
    await githubPage.click(`svg[aria-label="Edit repository metadata"]`);
    await githubPage.focus(`#repo_description`);

    const oldDescription = await githubPage.evaluate(
        () => (document.querySelector('#repo_description') as HTMLInputElement).value,
    );

    if (oldDescription === newDescription) {
        // TODO: [🥗] There should be 2 different returns: skippingBecauseOf VS notingChangedBecauseOf
        return skippingBecauseOf(`Description is up-to-date`);
    }

    await githubPage.keyboard.down('Control');
    await githubPage.keyboard.press('A');
    await githubPage.keyboard.up('Control');
    await githubPage.keyboard.press('Backspace');
    await githubPage.keyboard.type(newDescription, { delay: 50 });
    await clickOnText(githubPage, 'Save changes');

    return madeSideEffect(`Changed description in GitHub repository settings`);
}

descriptionInGithub.initialize = prepareGithubPage;
