import { copyFile } from 'fs/promises';
import glob from 'glob-promise';
import { join, relative } from 'path';
import { execCommand } from '../../utils/execCommand/execCommand';
import { IWorkflowOptions } from '../IWorkflow';

export async function lines({ projectPath, commit }: IWorkflowOptions): Promise<void> {
    for (const filePath of await glob(join(projectPath, '**/*'), {
        dot: true,
        ignore: ['**/node_modules/**', '**/.git/**'],
    })) {
        const command = `dos2unix ./${relative(projectPath, filePath).split('\\').join('/')}`;
        await execCommand({
            command,
            crashOnError: false,
            cwd: projectPath,
            // TODO: Probbably not so verborse
        });
    }

    await commit('⏎ Changing lines to unix');

    // TODO: Some util to copy boilerplate files
    for (const boilerplateFilePath of await glob(join(__dirname, 'boilerplate/**/*'), { dot: true })) {
        const projectFilePath = join(projectPath, relative(join(__dirname, 'boilerplate'), boilerplateFilePath));
        await copyFile(boilerplateFilePath, projectFilePath);
    }

    await commit('⏎ Adding rules for unix lines ');
}
