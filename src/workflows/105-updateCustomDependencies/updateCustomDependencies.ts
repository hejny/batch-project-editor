import chalk from 'chalk';
import { spawn } from 'child_process';
import { locateVSCode } from 'locate-app';
import spaceTrim from 'spacetrim';
import { fetchPackageVersion } from '../../utils/fetchPackageVersion';
import { IWorkflowOptions, WorkflowResult } from '../IWorkflow';

//export async function updateDependency(): IWorkflow{}

export async function updateCustomDependencies({
    packageJson,
    projectPath,
    projectTitle,
    runCommand,
    commit,
    skippingBecauseOf,
}: IWorkflowOptions): Promise<WorkflowResult> {
    const dependencyName = 'spacetrim'; /* <- TODO: More libraries */
    // TODO: [0] for (const libraryName of ['spacetrim']) {

    const dependencyUsedVersion =
        (packageJson.dependencies || {})[dependencyName] || (packageJson.devDependencies || {})[dependencyName];

    if (!dependencyUsedVersion) {
        return /* [0] */ skippingBecauseOf(`Not using ${dependencyName}`);
    }

    const dependencyCurrentVersion = await fetchPackageVersion(dependencyName);

    if (dependencyUsedVersion === dependencyCurrentVersion) {
        return /* [0] */ skippingBecauseOf(`Using ${dependencyName} in current version ${dependencyUsedVersion}`);
    }

    const updateSingnature = `${dependencyName}@${dependencyUsedVersion} → ${dependencyName}@${dependencyCurrentVersion}`;
    console.info(chalk.cyan(`Updating ${updateSingnature}`));

    try {

        await runCommand(`npm install ${dependencyName}@${dependencyCurrentVersion}`);
        await runCommand(`npm run test`);

        return await commit(
            /* [0] */
            spaceTrim(`
                🔼 Update library ${dependencyName} to ${dependencyCurrentVersion}

                ${updateSingnature}
            `),
        );
    } catch (error) {
        console.info(
            chalk.gray(`⏩ Opening project ${projectTitle} in VSCode because update ${updateSingnature} failed.`),
        );

        spawn(await locateVSCode(), [projectPath]);
        throw new Error(error);
    }
}
