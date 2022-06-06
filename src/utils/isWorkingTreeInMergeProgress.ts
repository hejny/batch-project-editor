import { execCommand } from './execCommand/execCommand';

export async function isWorkingTreeInMergeProgress(path: string): Promise<boolean> {
    const gitStatus = await execCommand({
        cwd: path,
        command: `git status`,
    });

    return gitStatus.includes(`You have unmerged paths`);
}
