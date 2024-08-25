import chalk from 'chalk';
import { normalizeTo_PascalCase } from '@promptbook/utils';
import spaceTrim from 'spacetrim';
import { fetchPackageVersion } from '../../utils/fetchPackageVersion';
import { removeDependencyPrefix } from '../../utils/removeDependencyPrefix';
import { IWorkflow, IWorkflowOptions } from '../IWorkflow';

export function createUpdateDependencyWorkflow(dependencyName: string): IWorkflow {
    const workflowName = `updateDependency${normalizeTo_PascalCase(dependencyName)}`;
    return {
        [workflowName]: async function ({
            packageJson,
            projectPath,
            projectTitle,
            execCommandOnProject,
            commit,
            skippingBecauseOf,
        }: IWorkflowOptions) {
            const dependencyUsedVersionWithPrefix =
                (packageJson.dependencies || {})[dependencyName] || (packageJson.devDependencies || {})[dependencyName];

            if (!dependencyUsedVersionWithPrefix) {
                return /* [0] */ skippingBecauseOf(`not using ${dependencyName}`);
            }

            const dependencyUsedVersion = removeDependencyPrefix(dependencyUsedVersionWithPrefix);

            const dependencyUpToDateVersion = await fetchPackageVersion(dependencyName);

            if (dependencyUsedVersion === dependencyUpToDateVersion) {
                return /* [0] */ skippingBecauseOf(
                    `Already using ${dependencyName} in current version ${dependencyUsedVersion}`,
                );
            }

            const updateSingnature = `${dependencyName}@${dependencyUsedVersion} → ${dependencyName}@${dependencyUpToDateVersion}`;
            console.info(chalk.cyan(`Updating ${updateSingnature}`));

            try {
                await execCommandOnProject(`pnpm install ${dependencyName}@${dependencyUpToDateVersion}`);
                await execCommandOnProject(`pnpm run test`);

                return await commit(
                    /* [0] */
                    spaceTrim(`
                        🔼 Update ${dependencyName} to ${dependencyUpToDateVersion}

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
