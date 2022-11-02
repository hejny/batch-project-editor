import chalk from 'chalk';
import { BATCH_PROJECT_EDITOR_COMMIT_SIGNATURE } from '../config';
import { execGitCommit } from './execCommand/execGitCommit';
import { isWorkingTreeClean } from './isWorkingTreeClean';

interface ICommitOptions {
    projectPath: string;
    message: string;
    workflowName: string;
}

export async function commit({ projectPath, message, workflowName }: ICommitOptions): Promise<boolean> {
    if (await isWorkingTreeClean(projectPath)) {
        console.info(chalk.gray(`⏩ Not commiting because nothings changed`));
        return false;
    }

    return await execGitCommit({
        cwd: projectPath,
        messageTitle: message,
        messageDescription: `${BATCH_PROJECT_EDITOR_COMMIT_SIGNATURE} using workflow ${workflowName}`,

        isAllAdded: true,
        isPushed: true,
    });
}
