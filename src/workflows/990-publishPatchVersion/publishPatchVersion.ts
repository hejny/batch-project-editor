import spaceTrim from 'spacetrim';
import { execCommand } from '../../utils/execCommand/execCommand';
import { IWorkflowOptions, WorkflowResult } from '../IWorkflow';

export async function publishPatchVersion({
    projectPath,
    madeSideEffect,
    execCommandOnProject,
    commit,
}: IWorkflowOptions): Promise<WorkflowResult> {
    await execCommand({
        cwd: projectPath,
        crashOnError: true,
        command: 'npm version patch',
    });

    return madeSideEffect(
        spaceTrim(`
          Released patch version
    `),
    );
}

/**
 * TODO: !! Workflows with multiple commits split into multiple functions
 */
