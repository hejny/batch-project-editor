import { mkdir, unlink, writeFile } from 'fs/promises';
import { dirname, join } from 'path';
import { execCommand } from './execCommand';
import { IExecCommandOptionsAdvanced } from './IExecCommandOptions';

export async function execGitCommit(
    options: { message: string; isAllAdded?: boolean; isPushed?: boolean } & Partial<
        Pick<IExecCommandOptionsAdvanced, 'args' | 'cwd' | 'timeout'>
    >,
): Promise<boolean> {
    const { message, isAllAdded, isPushed, args, cwd, timeout } = options;

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
        await writeFile(messageFilePath, message, 'utf8');

        await execCommand({
            cwd,
            args,
            timeout,
            crashOnError: false,
            command: `git commit --file ${messageFilePath}`,
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
