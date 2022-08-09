import { IWorkflowOptions, WorkflowResult } from '../IWorkflow';

export async function repository({ commit, modifyPackage, runCommand }: IWorkflowOptions): Promise<WorkflowResult> {
    const repositoryUrl = await runCommand(`git config --get remote.origin.url`);
    await modifyPackage((packageJson) => {
        packageJson.repository = {
            type: 'git',
            url: repositoryUrl,
        };
    });
    return commit('🍱 Add repository into package.json');
}
