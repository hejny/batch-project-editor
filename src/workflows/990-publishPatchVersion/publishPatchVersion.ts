import spaceTrim from 'spacetrim';
import { execCommand } from '../../utils/execCommand/execCommand';
import { IWorkflowOptions, WorkflowResult } from '../IWorkflow';

export async function publishPatchVersion({
    packageJson,
    projectPath,
    madeSideEffect,
    execCommandOnProject,
    commit,
    skippingBecauseOf,
}: IWorkflowOptions): Promise<WorkflowResult> {
    if ((packageJson.version || '-').includes('-')) {
        return skippingBecauseOf(`Not making patch version because currently in prerelease`);
    }

    await execCommandOnProject(`npm install --package-lock-only`);
    await execCommandOnProject(`rm pnpm-lock.yaml -f`); // <-   -f, --force           ignore nonexistent files and arguments, never prompt
    await execCommandOnProject(`rm yarn.lock -f`);

    await commit(
        spaceTrim(`
            🔽 Install dependencies

             Before releasing the package, install it using most standard installers - NPM and remove all other lockfiles.

        `),
    );

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
