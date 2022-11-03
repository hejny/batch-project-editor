import { copyFile } from 'fs/promises';
import glob from 'glob-promise';
import { join, relative } from 'path';
import { IWorkflowOptions, WorkflowResult } from '../IWorkflow';

export async function libraryBoilerplate({
    projectPath,
    commit,
    skippingBecauseOf,
}: IWorkflowOptions): Promise<WorkflowResult> {
    return skippingBecauseOf(`not implemented yet`);
    // TODO: !! Combine files like JSONs and YML and give priority to existing project ones
    // TODO: !! Skip on non-lib projects
    // TODO: Some util to copy boilerplate files @see fca7572fcb4d834d3bba6b883439a8f81e052986
    for (const boilerplateFilePath of await glob(join(__dirname, 'boilerplate/**/*'), { dot: true })) {
        const projectFilePath = join(projectPath, relative(join(__dirname, 'boilerplate'), boilerplateFilePath));
        await copyFile(boilerplateFilePath, projectFilePath);
    }

    return commit('⏎ Adding rules for unix lines ');
}

/**
 * TODO: !! Split between universal and library boilerplate
 */
