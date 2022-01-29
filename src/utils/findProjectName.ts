import { readFile } from 'fs/promises';
import { basename, join } from 'path';
import { PackageJson } from 'type-fest';
import { isFileExisting } from './isFileExisting';

export async function findProjectName(projectPath: string): Promise<string> {
    if (await isFileExisting(join(projectPath, 'package.json'))) {
        const projectName = (JSON.parse(await readFile(join(projectPath, 'package.json'), 'utf8')) as PackageJson).name;

        if (projectName) {
            return projectName;
        }
    }

    return basename(projectPath);
}
