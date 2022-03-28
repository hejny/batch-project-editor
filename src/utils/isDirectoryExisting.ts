import { access, constants, stat } from 'fs';
import { promisify } from 'util';

export async function isDirectoryExisting(folderPath: string): Promise<boolean> {
    try {
        await promisify(access)(folderPath, constants.R_OK);
        const fileStat = await promisify(stat)(folderPath);
        return fileStat.isDirectory();
    } catch (error) {
        return false;
    }
}
