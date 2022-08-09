import spaceTrim from 'spacetrim';
import { execCommand } from '../../utils/execCommand/execCommand';
import { IWorkflowOptions, WorkflowResult } from '../IWorkflow';

export async function auditDependencies({
    projectPath,
    modifyPackage,
    runCommand,
    commit,
}: IWorkflowOptions): Promise<WorkflowResult> {
    await execCommand({ cwd: projectPath, crashOnError: false, command: 'npm install' });
    await execCommand({ cwd: projectPath, crashOnError: false, command: 'npm audit fix' });

    await commit(
        spaceTrim(`
          🔺 Audit dependencies

          Executed command \`npm audit fix\`
      `),
    );

    // Note: Removing prefixes before versioning - we just want "10.4.0" not "^10.4.0" @see https://youtu.be/ctkGh7RpgQ8
    await modifyPackage((packageContent) => {
        for (const type of ['devDependencies', 'dependencies']) {
            for (const dependency in packageContent[type]) {
                const match = packageContent[type][dependency].match(
                    /([0-9]+)\.([0-9]+)\.([0-9]+)(?:-([0-9A-Za-z-]+(?:\.[0-9A-Za-z-]+)*))?(?:\+[0-9A-Za-z-]+)?$/,
                );

                if (!match) {
                    continue;
                }

                packageContent[type][dependency] = match![0];
            }
        }
        return packageContent;
    });

    return commit(
        spaceTrim(`
          🔺 Removing dependencies prefixes

          Removing prefixes before versioning - we just want "10.4.0" not "^10.4.0"
          For more reasoning watch https://youtu.be/ctkGh7RpgQ8
    `),
    );
}

/**
 * TODO: !!! Workflows with multiple commits split into multiple functions
 */
