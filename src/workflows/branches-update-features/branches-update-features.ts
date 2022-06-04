import { IWorkflowOptions } from '../IWorkflow';

/**
 * Go through not merged branches and update them with the latest commit the main.
 * - It will take only recent branches = branches with commits in the last month
 * - It will take only feature branches = branches that start with `feature/`
 */
export async function branchesUpdateFeatures({ commit, runCommand }: IWorkflowOptions): Promise<void> {
  

    await runCommand('git fetch origin --prune --tags --no-recurse-submodules');

    const branches = (await runCommand('git branch --no-merged')).split('\n');
    const fetureBranches = branches.filter((branch) => branch.startsWith('feature/'));
    const recentBranches = fetureBranches.filterAsync(async (branch) => {
        const lastCommit = (await runCommand(`git log -1 --format=%ct ${branch}`)).trim();
        const lastCommitDate = new Date(parseInt(lastCommit, 10) * 1000);
        const now = new Date();
        return now.getMonth() - lastCommitDate.getMonth() <= 1;
    });

    console.log({
        branches,
        fetureBranches,
        recentBranches,
    });

    /*
    for (const branch of fetureBranches) {
        await runCommand(`git checkout ${branch}`);
        await runCommand('git pull');

    }
    */
}
