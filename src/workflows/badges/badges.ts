import { IWorkflowOptions } from '../IWorkflow';

export async function badges({ modifyFiles, commit }: IWorkflowOptions): Promise<void> {
    // TODO: !!! Require updated main/master branch

    await modifyFiles('README.md', async (readmeContent) => {
        return readmeContent + 'wololooo';
    });

    await commit('📛 Update badges');
}
