import chalk from 'chalk';
import { capitalize } from 'lodash';
import spaceTrim from 'spacetrim';
import { fetchPackageVersion } from '../../utils/fetchPackageVersion';
import { removeDependencyPrefix } from '../../utils/removeDependencyPrefix';
import { IWorkflow, IWorkflowOptions } from '../IWorkflow';

export function updateDependency(dependencyName: string): IWorkflow {
    const workflowName = `update${capitalize(dependencyName)}`;
    return {
        [workflowName]: async function ({
            packageJson,
            projectPath,
            projectTitle,
            runCommand,
            commit,
            skippingBecauseOf,
        }: IWorkflowOptions) {
            const dependencyName = 'spacetrim'; /* <- TODO: More libraries */
            // TODO: [0] for (const libraryName of ['spacetrim']) {

            const dependencyUsedVersionWithPrefix =
                (packageJson.dependencies || {})[dependencyName] || (packageJson.devDependencies || {})[dependencyName];

            if (!dependencyUsedVersionWithPrefix) {
                return /* [0] */ skippingBecauseOf(`Not using ${dependencyName}`);
            }

            const dependencyUsedVersion = removeDependencyPrefix(dependencyUsedVersionWithPrefix);

            const dependencyCurrentVersion = await fetchPackageVersion(dependencyName);

            if (dependencyUsedVersion === dependencyCurrentVersion) {
                return /* [0] */ skippingBecauseOf(
                    `Using ${dependencyName} in current version ${dependencyUsedVersion}`,
                );
            }

            const updateSingnature = `${dependencyName}@${dependencyUsedVersion} → ${dependencyName}@${dependencyCurrentVersion}`;
            console.info(chalk.cyan(`Updating ${updateSingnature}`));

            try {
                await runCommand(`npm install ${dependencyName}@${dependencyCurrentVersion}`);
                await runCommand(`npm run test`);

                return await commit(
                    /* [0] */
                    spaceTrim(`
                        🔼 Update ${dependencyName} to ${dependencyCurrentVersion}

                        ${updateSingnature}
                    `),
                );
            } catch (error) {
                /*
                TODO: Make for this flag + IWorkflowOptions util

                import { spawn } from 'child_process';
                import { locateVSCode } from 'locate-app';


                console.info(
                    chalk.gray(
                        `⏩ Opening project ${projectTitle} in VSCode because update ${updateSingnature} failed.`,
                    ),
                );

                spawn(await locateVSCode(), [projectPath]);

                */
                throw error;
            }
        },
    }[workflowName /* <- [0] */];
}

/**
 * Note: [0] THis is a hack how to assign name to workflow function
 *           @see https://stackoverflow.com/questions/9479046/is-there-any-non-eval-way-to-create-a-function-with-a-runtime-determined-name/9479081#9479081
 */