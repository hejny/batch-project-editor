import glob from 'glob-promise';
import { join } from 'path';
import { BASE_PATH } from '../config';

export async function findAllProjects(): Promise<string[]> {
    //return ['C:/Users/me/work/hejny/configchecker'];
    //return ['C:/Users/me/autowork/collboard/hello-world-module'];

    return (await glob(join(BASE_PATH, '**/*/.git'), { ignore: '**/node_modules/**' })).map((folderPath) =>
        join(folderPath, '..'),
    );
}
