import glob from 'glob-promise';
import { join } from 'path';
import { BASE_PATH } from '../config';

export async function findAllProjects(): Promise<string[]> {
    return (await glob(join(BASE_PATH, '**/*/.git'), { ignore: '**/node_modules/**' })).map((folderPath) =>
        join(folderPath, '..'),
    );
}
