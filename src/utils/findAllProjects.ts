import glob from 'glob-promise';
import { join } from 'path';
import { BASE_PATH } from '../config';

export async function findAllProjects(): Promise<string[]> {
    return ['C:/Users/me/work/hejny/configchecker'];

    // TODO: !!! Quicker searcg

    return (await glob(join(BASE_PATH, '**/*/.git'))).map((folderPath) => join(folderPath, '..'));
}
