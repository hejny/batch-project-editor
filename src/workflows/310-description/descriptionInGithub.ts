import { clickOnText } from '../../utils/clickOnText';
import { getGithubPage, prepareGithubPage } from '../315-ai-generated-wallpaper/utils/githubPage';
import { IWorkflowOptions, WorkflowResult } from '../IWorkflow';

export async function descriptionInGithub({
    packageJson,
    skippingBecauseOf,
    projectUrl,
}: IWorkflowOptions): Promise<WorkflowResult> {
    const description = packageJson.description;

    if (!description) {
        return skippingBecauseOf(`No description extracted from README.md`);
    }

    const githubPage = await getGithubPage();

    await githubPage.goto(`${projectUrl}`, { waitUntil: 'networkidle0' });
    await githubPage.click(`svg[aria-label="Edit repository metadata"]`);
    await githubPage.focus(`#repo_description`);
    await githubPage.keyboard.down('Control');
    await githubPage.keyboard.press('A');
    await githubPage.keyboard.up('Control');
    await githubPage.keyboard.press('Backspace');
    await githubPage.keyboard.type(description, { delay: 50 });
    await clickOnText(githubPage, 'Save changes');

    return WorkflowResult.SideEffect;
}

descriptionInGithub.initialize = prepareGithubPage;
