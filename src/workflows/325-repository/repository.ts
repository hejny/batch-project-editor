import { IWorkflowOptions } from '../IWorkflow';

export async function repository({ commit, modifyPackage, runCommand }: IWorkflowOptions): Promise<void> {
    const repositoryUrl = await runCommand(`git config --get remote.origin.url`);
    await modifyPackage((packageJson) => {
        packageJson.repository = {
            type: 'git',
            url: repositoryUrl,
        };
    });
    await commit('🍱 Add repository into package.json');
}
