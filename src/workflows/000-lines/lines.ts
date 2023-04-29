import { copyFile } from 'fs/promises';
import glob from 'glob-promise';
import { join, relative } from 'path';
import { execCommand } from '../../utils/execCommand/execCommand';
import { isFileExisting } from '../../utils/isFileExisting';
import { IWorkflowOptions, WorkflowResult } from '../IWorkflow';

export async function lines({ projectPath, commit }: IWorkflowOptions): Promise<WorkflowResult> {
    for (const filePath of await glob(join(projectPath, '**/*'), {
        dot: true,
        ignore: ['**/node_modules/**', '**/.git/**'],
    })) {
        if (!(await isFileExisting(filePath))) {
            /* Note: The path is not a file - for example a folder path */
            continue;
        }

        const command = `dos2unix ./${relative(projectPath, filePath).split('\\').join('/')}`;
        await execCommand({
            command,
            crashOnError: false,
            cwd: projectPath,
            // TODO: Probbably not so verborse
        });
    }

    return commit('⏎ Changing lines to unix');

    // TODO: Some util to copy boilerplate files - and make it as separate workflow
    for (const boilerplateFilePath of await glob(join(__dirname, 'boilerplate/**/*'), { dot: true })) {
        const projectFilePath = join(projectPath, relative(join(__dirname, 'boilerplate'), boilerplateFilePath));
        await copyFile(boilerplateFilePath, projectFilePath);
    }

    return commit('⏎ Adding rules for unix lines ');
}

/**
 * TODO: Use here propper IWorkflow utils NOT raw functions from 'fs/promises' and 'path'
 */
