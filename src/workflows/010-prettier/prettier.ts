import { join } from 'path';
import { execCommand } from '../../utils/execCommand/execCommand';
import { isFileExisting } from '../../utils/isFileExisting';
import { IWorkflowOptions } from '../IWorkflow';

export async function prettier({ projectPath, commit }: IWorkflowOptions): Promise<void> {
    // TODO: !!! Require updated main/master branch

    if (await isFileExisting(join(projectPath, '.prettierrc'))) {
      // !!! Add prettier to the project
      await commit('🧹 Configure prettier');
    }

    await execCommand({
      command: 'npx prettier --write',
      cwd: projectPath,
  });

    await commit('🧹 Prettier');

    await execCommand({
        command: 'npx organize-imports-cli',
        cwd: projectPath,
    });

    await commit('🧹 Organize imports');
}
