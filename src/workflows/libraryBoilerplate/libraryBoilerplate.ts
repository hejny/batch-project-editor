import { copyFile } from 'fs/promises';
import glob from 'glob-promise';
import { join, relative } from 'path';
import { forEver } from 'waitasecond';
import { execCommand } from '../../utils/execCommand/execCommand';
import { IWorkflowOptions } from '../IWorkflow';

export async function lines({ projectPath, commit }: IWorkflowOptions): Promise<void> {

  // TODO: !!! Combine files like JSONs and YML and give priority to existing project ones
  // TODO: !!! Skip on non-lib projects
    // TODO: Some util to copy boilerplate files
    for (const boilerplateFilePath of await glob(join(__dirname, 'boilerplate/**/*'), { dot: true })) {
        const projectFilePath = join(projectPath, relative(join(__dirname, 'boilerplate'), boilerplateFilePath));
        await copyFile(boilerplateFilePath, projectFilePath);
    }

    await commit('⏎ Adding rules for unix lines ');
}


/**
 * TODO: !!! Split between universal and library boilerplate
 */