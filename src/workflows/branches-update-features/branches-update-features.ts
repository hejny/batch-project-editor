import chalk from 'chalk';
import { spawn } from 'child_process';
import { locateVSCode } from 'locate-app';
import { IWorkflowOptions, WorkflowResult } from '../IWorkflow';

/**
 * Go through not merged branches and update them with the latest commit the main.
 * - It will take only recent branches = branches with commits in the last two months
 * - It will take only feature branches = branches that start with `feature/`
 */
export async function branchesUpdateFeatures({
    projectTitle,
    commit,
    execCommandOnProject,
    currentBranch,
    projectPath,
}: IWorkflowOptions): Promise<WorkflowResult> {
    const remoteBranches = (await execCommandOnProject(`git branch --remotes --no-merged ${currentBranch}`)).split(
        '\n',
    );
    const fetureRemoteBranches = remoteBranches.filter((branch) => /(origin\/)?feature\//.test(branch));
    const recentFeatureRemoteBranches = await fetureRemoteBranches.filterAsync(async (branch) => {
        const lastCommitDateRaw = (await execCommandOnProject(`git log -1 --format=%ct ${branch}`)).trim();
        const lastCommitDate = new Date(parseInt(lastCommitDateRaw, 10) * 1000);

        // Filter last two months - TODO: To some config
        return lastCommitDate > new Date(Date.now() - 1000 * 60 * 60 * 24 * 30 * 4 /* months */);
    });

    console.info(recentFeatureRemoteBranches);

    let isChanged = false;

    for (const remoteBranch of recentFeatureRemoteBranches) {
        const localBranch = remoteBranch.replace(/^origin\//, '');

        await execCommandOnProject(`git switch ${localBranch}`).catch((error) => {
            if (/Switched to( a new)? branch/i.test(error.message)) {
                return;
            } else {
                throw error;
            }
        });

        await execCommandOnProject('git pull');
        isChanged =
            isChanged ||
            (await execCommandOnProject(`git merge ${currentBranch}`)
                .catch((error) => {
                    return error.message as string;
                })
                .then(async (result) => {
                    // Automatic merge failed; fix conflicts and then commit the result.
                    if (/Automatic merge failed/i.test(result)) {
                        console.info(
                            chalk.gray(`⏩ Opening project ${projectTitle} in VSCode because automatic merge failed.`),
                        );

                        spawn(await locateVSCode(), [projectPath], { shell: true });
                        throw new Error(result);
                    } else if (/Already up to date/i.test(result)) {
                        return false;
                    } else {
                        // Merge made by the 'recursive' strategy.
                        return true;
                    }
                }));

        // Note: Here is already merge commit commited, now just push it.
        // return commit(`🍴 Update ${localBranch} with latest commit from ${currentBranch}`);

        await execCommandOnProject(`git push --quiet`);
    }

    return isChanged ? WorkflowResult.Change : WorkflowResult.NoChange;
}
