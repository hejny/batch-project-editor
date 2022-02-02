import { join } from 'path';
import { execCommand } from '../../utils/execCommand/execCommand';
import { isFileExisting } from '../../utils/isFileExisting';
import { IWorkflowOptions } from '../IWorkflow';

export async function prettier({ projectPath, commit }: IWorkflowOptions): Promise<void> {
    return; // TODO: !!! Make this workflow working
    if (await isFileExisting(join(projectPath, '.prettierrc'))) {
        // !!! Add prettier to the project
        await commit('🧹 Configure prettier');
    }

    await execCommand({
        command: 'npx prettier --write',
        crashOnError: false,
        cwd: projectPath,
    });

    await commit('🧹 Prettier');

    await execCommand({
        command: 'npx organize-imports-cli',
        crashOnError: false,
        cwd: projectPath,
    });

    await commit('🧹 Organize imports');
}
