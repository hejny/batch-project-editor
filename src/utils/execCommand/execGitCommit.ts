import { mkdir, unlink, writeFile } from 'fs/promises';
import { dirname, join } from 'path';
import { execCommand } from './execCommand';
import { IExecCommandOptionsAdvanced } from './IExecCommandOptions';

export async function execGitCommit(
    options: {
        messageTitle: string;
        messageDescription: string;
        isAllAdded?: boolean;
        isPushed?: boolean;
        isEmptyCommitAllowed?: boolean;
    } & Partial<Pick<IExecCommandOptionsAdvanced, 'args' | 'cwd' | 'timeout'>>,
): Promise<boolean> {
    const { messageTitle, messageDescription, isAllAdded, isPushed, isEmptyCommitAllowed, args, cwd, timeout } =
        options;

    const messageFilePath = join(process.cwd(), '.tmp', 'COMMIT_MESSAGE');

    try {
        if (isAllAdded) {
            await execCommand({
                cwd,
                timeout,
                crashOnError: false,
                command: `git add .`,
            });
        }

        await mkdir(dirname(messageFilePath), { recursive: true });
        await writeFile(messageFilePath, messageTitle + '\n\n' + messageDescription, 'utf8');

        await execCommand({
            cwd,
            args,
            timeout,
            crashOnError: false,
            command: `git commit${isEmptyCommitAllowed ? ` --allow-empty` : ``} --file ${messageFilePath}`,
        });

        if (isPushed) {
            await execCommand({
                cwd,
                timeout,
                crashOnError: false,
                command: `git push --quiet`,
            });
        }

        return true;
    } catch (error) {
        console.error(error);
        return true;
    } finally {
        await unlink(messageFilePath);
    }
}
