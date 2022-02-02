import { copyFile, readFile } from 'fs/promises';
import glob from 'glob-promise';
import { basename, join, relative } from 'path';
import { combineDeep } from '../../utils/combineDeep';
import { isFileExisting } from '../../utils/isFileExisting';
import { IWorkflowOptions } from '../IWorkflow';

export async function license({ projectPath, modifyPackage, commit }: IWorkflowOptions): Promise<void> {
    // TODO: !!! Combine files like JSONs and YML and give priority to existing project ones
    // TODO: Some util to copy boilerplate files

    for (const boilerplateFilePath of await glob(join(__dirname, 'boilerplate/**/*'), { dot: true })) {
        const projectFilePath = join(projectPath, relative(join(__dirname, 'boilerplate'), boilerplateFilePath));

        if (!(await isFileExisting(projectFilePath))) {
            await copyFile(boilerplateFilePath, projectFilePath);
        } else {
            if (basename(projectFilePath) === 'package.json') {
                modifyPackage(async (packageJson) =>
                    combineDeep(packageJson, JSON.parse(await readFile(join(projectPath, 'package.json'), 'utf8'))),
                );
            } else {
                throw new Error(`Boilerplate colliding with file ${projectFilePath}.`);
            }
        }
    }

    await commit('📝 License ');
}

/**
 * TODO: !!! Split between universal and library boilerplate
 * TODO: Combine also other files than pakcage.json > if (/\.json$/.test(projectFilePath)) {
 */
