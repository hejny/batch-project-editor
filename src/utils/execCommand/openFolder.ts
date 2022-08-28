import chalk from 'chalk';
import { isFolderExisting } from '../isFolderExisting';
import { execCommand } from './execCommand';

export async function openFolder(path: string) {
    path = path.split('\\').join('/');

    if (!(await isFolderExisting(path))) {
        throw new Error(`Folder "${path}" does not exist so cannot be opened in explorer`);
    }

    console.info(chalk.bgGrey(` 📂  Opening ${path}`));

    await execCommand({ cwd: path, command: `explorer .`, crashOnError: false });
}

/**
 * TODO: Is better way to run "explorer" or "Explorer.exe"?
 */
