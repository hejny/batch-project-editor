import { access, constants, stat } from 'fs';
import { promisify } from 'util';

export async function isFileExisting(filePath: string): Promise<boolean> {
    try {
        await promisify(access)(filePath, constants.R_OK);
        const fileStat = await promisify(stat)(filePath);
        return fileStat.isFile();
    } catch (error) {
        return false;
    }
}
