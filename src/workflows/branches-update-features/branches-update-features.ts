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
    runCommand,
    mainBranch,
    projectPath,
}: IWorkflowOptions): Promise<WorkflowResult> {
    const remoteBranches = (await runCommand(`git branch --remotes --no-merged ${mainBranch}`)).split('\n');
    const fetureRemoteBranches = remoteBranches.filter((branch) => /(origin\/)?feature\//.test(branch));
    const recentFeatureRemoteBranches = await fetureRemoteBranches.filterAsync(async (branch) => {
        const lastCommitDateRaw = (await runCommand(`git log -1 --format=%ct ${branch}`)).trim();
        const lastCommitDate = new Date(parseInt(lastCommitDateRaw, 10) * 1000);

        // Filter last two months - TODO: To some config
        return lastCommitDate > new Date(Date.now() - 1000 * 60 * 60 * 24 * 30 * 4 /* months */);
    });

    console.info(recentFeatureRemoteBranches);

    let isChanged = false;

    for (const remoteBranch of recentFeatureRemoteBranches) {
        const localBranch = remoteBranch.replace(/^origin\//, '');

        await runCommand(`git switch ${localBranch}`).catch((error) => {
            if (/Switched to( a new)? branch/i.test(error.message)) {
                return;
            } else {
                throw error;
            }
        });

        await runCommand('git pull');
        isChanged =
            isChanged ||
            (await runCommand(`git merge ${mainBranch}`)
                .catch((error) => {
                    return error.message as string;
                })
                .then(async (result) => {
                    // Automatic merge failed; fix conflicts and then commit the result.
                    if (/Automatic merge failed/i.test(result)) {
                        console.info(
                            chalk.gray(`⏩ Opening project ${projectTitle} in VSCode because automatic merge failed.`),
                        );

                        spawn(await locateVSCode(), [projectPath]);
                        throw new Error(result);
                    } else if (/Already up to date/i.test(result)) {
                        return false;
                    } else {
                        // Merge made by the 'recursive' strategy.
                        return true;
                    }
                }));

        // Note: Here is already merge commit commited, now just push it.
        // return commit(`🍴 Update ${localBranch} with latest commit from ${mainBranch}`);

        await runCommand(`git push --quiet`);
    }

    return isChanged ? WorkflowResult.Change : WorkflowResult.NoChange;
}
