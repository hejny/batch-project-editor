import { IWorkflowOptions, WorkflowResult } from '../IWorkflow';

export async function repository({
    commit,
    modifyPackage,
    execCommandOnProject,
}: IWorkflowOptions): Promise<WorkflowResult> {
    const repositoryUrl = await execCommandOnProject(`git config --get remote.origin.url`);
    await modifyPackage((packageJson) => {
        packageJson.repository = {
            type: 'git',
            url: `git+${repositoryUrl.trim()}.git`,
        };
    });
    return commit('🍱 Add repository into package.json');
}
