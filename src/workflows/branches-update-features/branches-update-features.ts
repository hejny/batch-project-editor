import { IWorkflowOptions } from '../IWorkflow';

/**
 * Go through not merged branches and update them with the latest commit the main.
 * - It will take only recent branches = branches with commits in the last two months
 * - It will take only feature branches = branches that start with `feature/`
 */
export async function branchesUpdateFeatures({ commit, runCommand, mainBranch }: IWorkflowOptions): Promise<void> {
    const branches = (await runCommand(`git branch --remotes --no-merged ${mainBranch}`)).split('\n');
    const fetureBranches = branches.filter((branch) => /(origin\/)?feature\//.test(branch));
    const recentBranches = await fetureBranches.filterAsync(async (branch) => {
        const lastCommitDateRaw = (await runCommand(`git log -1 --format=%ct ${branch}`)).trim();
        const lastCommitDate = new Date(parseInt(lastCommitDateRaw, 10) * 1000);
        console.log(lastCommitDate);

        // Filter last two months
        return lastCommitDate > new Date(Date.now() - 1000 * 60 * 60 * 24 * 30 * 2);
    });

    console.info({
        branches,
        fetureBranches,
        recentBranches,
    });

    for (const branch of fetureBranches) {
        await runCommand(`git checkout ${branch}`);
        await runCommand('git pull');
    }
}
