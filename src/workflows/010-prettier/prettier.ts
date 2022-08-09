import { join } from 'path';
import { execCommand } from '../../utils/execCommand/execCommand';
import { isFileExisting } from '../../utils/isFileExisting';
import { IWorkflowOptions, WorkflowResult } from '../IWorkflow';

export async function prettier({ projectPath, commit, skippingBecauseOf }: IWorkflowOptions): Promise<WorkflowResult> {
    return skippingBecauseOf(`Not implemented yet`);
    // TODO: !!! Make this workflow working
    if (await isFileExisting(join(projectPath, '.prettierrc'))) {
        // !!! Add prettier to the project
        return commit('🧹 Configure prettier');
    }

    await execCommand({
        command: 'npx prettier --write',
        crashOnError: false,
        cwd: projectPath,
    });

    return commit('🧹 Prettier');

    await execCommand({
        command: 'npx organize-imports-cli',
        crashOnError: false,
        cwd: projectPath,
    });

    return commit('🧹 Organize imports');
}
