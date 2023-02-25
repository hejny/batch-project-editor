import { execCommand } from '../../utils/execCommand/execCommand';
import { IWorkflowOptions, WorkflowResult } from '../IWorkflow';

export async function organizeImports({
    projectPath,
    commit,
    skippingBecauseOf,
}: IWorkflowOptions): Promise<WorkflowResult> {
    await execCommand({
        command: 'npx organize-imports-cli tsconfig.json',
        crashOnError: false,
        cwd: projectPath,
    });

    return commit('🧹 Organize imports');
}

/**
 * TODO: !! Make this workflow working
 */
