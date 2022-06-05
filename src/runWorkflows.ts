#!/usr/bin/env ts-node

import chalk from 'chalk';
import { mkdir, readFile, writeFile } from 'fs/promises';
import glob from 'glob-promise';
import { basename, dirname, join } from 'path';
import spaceTrim from 'spacetrim';
import { PackageJson, Promisable } from 'type-fest';
import { execCommand } from './utils/execCommand/execCommand';
import { findAllProjects } from './utils/findAllProjects';
import { findProjectName } from './utils/findProjectName';
import { findProjectTitle } from './utils/findProjectTitle';
import { forPlay } from './utils/forPlay';
import { isFileExisting } from './utils/isFileExisting';
import { isWorkingTreeClean } from './utils/isWorkingTreeClean';
import { WORKFLOWS } from './workflows/workflows';

interface IRunWorkflowsOptions {
    runWorkflows: string[] | true;
    runProjects: string[] | true;
}

export async function runWorkflows({ runWorkflows, runProjects }: IRunWorkflowsOptions) {
    const errors: { projectTitle: string; workflowName: string; error: Error }[] = [];
    const changedProjects: { projectTitle: string; projectUrl: URL }[] = [];

    // console.log({ runProjects, runWorkflows });
    // console.log(await findAllProjects());
    // await forEver();

    for (const projectPath of await findAllProjects()) {
        // console.log({ project: basename(projectPath /* TODO: Match more things in projects */) });
        if (
            runProjects !== true &&
            !runProjects.includes(basename(projectPath /* TODO: Match more things in projects */))
        ) {
            continue;
        }

        for (const workflow of WORKFLOWS) {
            // console.log({ workflows: workflow.name }, runWorkflows !== true && !runWorkflows.includes(workflow.name));
            if (runWorkflows !== true && !runWorkflows.includes(workflow.name)) {
                continue;
            }

            await forPlay();

            const projectTitle = await findProjectTitle(projectPath);
            const { name: projectName, org: projectOrg, url: projectUrl } = await findProjectName(projectPath);

            try {
                let currentBranch = await execCommand({
                    command: 'git branch --show-current',
                    cwd: projectPath,
                });

                if (!(await isWorkingTreeClean(projectPath))) {
                    console.info(chalk.gray(`⏩ Skipping project ${projectTitle} because working dir is not clean`));
                    continue;
                }

                if (currentBranch !== 'main' && currentBranch !== 'master') {
                    console.info(`👉 Switching from branch ${currentBranch} to main.`);

                    const result = await execCommand({
                        command: 'git switch main',
                        cwd: projectPath,
                        crashOnError: false,
                    });

                    if (!result.includes(`Switched to branch 'main'`)) {
                        console.info(
                            chalk.gray(`⏩ Skipping project ${projectTitle} because can not switch to main branch`),
                        );
                        continue;
                    }

                    currentBranch = 'main';

                    /*
                console.info(
                    `⏩ Skipping project ${projectTitle} because current branch is not main (or master) but ${currentBranch}.`,
                );
                continue;
                */
                }

                if (!(await isFileExisting(join(projectPath, 'package.json')))) {
                    console.info(chalk.gray(`⏩ Skipping project ${projectTitle} because package.json does not exist`));
                    continue;
                }

                console.info(`🔼 Running workflow ${workflow.name} for project ${projectTitle}`);

                await execCommand({
                    command: 'git pull',
                    crashOnError: false,
                    cwd: projectPath,
                });

                const configPath = join(projectPath, 'batch-project-editor.js');
                if (await isFileExisting(configPath)) {
                    const config = require(configPath);
                    if (config.ignoreWorkflows) {
                        if (config.ignoreWorkflows.includes(workflow.name)) {
                            console.info(
                                chalk.gray(
                                    `⏩ Skipping workflow ${workflow.name} for project ${projectTitle} because projects config ignores this workflow`,
                                ),
                            );
                            continue;
                        }
                    }
                }

                async function modifyFiles(
                    globPattern: string,
                    fileModifier: (fileContent: string) => Promisable<string>,
                ): Promise<void> {
                    for (const filePath of await glob(join(projectPath, globPattern), {
                        dot: true,
                        ignore: ['**/node_modules/**', '**/.git/**'],
                    })) {
                        const fileContent = await readFile(filePath, 'utf8');
                        const newFileContent = await fileModifier(fileContent);

                        if (fileContent !== newFileContent) {
                            console.info(`💾 Changing file ${filePath}`);
                            await writeFile(filePath, newFileContent);
                        } else {
                            // console.info(`⬜ Keeping file ${filePath}`);
                        }
                    }
                }

                function readProjectFile(filePath: string): Promise<string> {
                    return readFile(join(projectPath, filePath), 'utf8');
                }

                function modifyJsonFiles<T>(
                    globPattern: string,
                    fileModifier: (fileContent: T) => Promisable<T>,
                ): Promise<void> {
                    return modifyFiles(globPattern, async (fileContent) => {
                        const fileJson = JSON.parse(fileContent);
                        return JSON.stringify((await fileModifier(fileJson)) || fileJson, null, 4) + '\n';
                    });
                }

                const packageJson = JSON.parse(await readFile(join(projectPath, 'package.json'), 'utf8'));

                function modifyPackage(
                    fileModifier: (packageContent: PackageJson) => Promisable<PackageJson>,
                ): Promise<void> {
                    return modifyJsonFiles<PackageJson>('package.json', (packageJson) => fileModifier(packageJson));
                }

                // TODO: !!! Rename to execCommand
                function runCommand(command: string) {
                    return execCommand({
                        command,
                        cwd: projectPath,
                    });
                }

                let isCommitted = false;
                async function commit(message: string): Promise<void> {
                    if (await isWorkingTreeClean(projectPath)) {
                        console.info(chalk.gray(`⏩ Not commiting because nothings changed`));
                        return;
                    }

                    await execCommand({
                        cwd: projectPath,
                        crashOnError: false,
                        command: `git add .`,
                    });

                    const commitMessageFilePath = join(process.cwd(), '.tmp', 'COMMIT_MESSAGE');
                    const commitMessage = spaceTrim(
                        (block) => `
                      ${block(message)}

                      🔼 This commit was automatically generated by [Batch project editor](https://github.com/hejny/batch-project-editor)
                    `,
                    );

                    await mkdir(dirname(commitMessageFilePath), { recursive: true });
                    await writeFile(commitMessageFilePath, commitMessage, 'utf8');

                    await execCommand({
                        cwd: projectPath,
                        crashOnError: false,
                        command: `git commit --file ${commitMessageFilePath}`,
                    });

                    await execCommand({
                        cwd: projectPath,
                        crashOnError: false,
                        command: `git push --quiet`,
                    });

                    isCommitted = true;
                }

                await workflow({
                    projectTitle,
                    projectPath,
                    projectName,
                    projectUrl,
                    projectOrg,
                    packageJson,
                    mainBranch: currentBranch as 'main' | 'master',
                    runCommand,
                    readFile: readProjectFile,
                    modifyFiles,
                    modifyJsonFiles,
                    modifyPackage,
                    commit,
                });

                if (!(await isWorkingTreeClean(projectPath))) {
                    console.info(
                        chalk.red(
                            `❗ Workflow ${workflow.name} for the project ${projectTitle} ended with dirty working dir`,
                        ),
                    );
                    process.exit();
                }

                if (isCommitted) {
                    if (!changedProjects.some(({ projectTitle: projectTitle2 }) => projectTitle === projectTitle2)) {
                        changedProjects.push({ projectTitle, projectUrl });
                    }
                }
            } catch (error) {
                console.error(error);
                errors.push({ projectTitle, workflowName: workflow.name, error });
            }
        }
    }

    console.info(chalk.bgGreen(`Changed ${changedProjects.length} projects:`));

    for (const { projectTitle, projectUrl } of changedProjects) {
        console.info(chalk.bgGreen(` ${projectTitle} `) + ' ' + chalk.gray(projectUrl.href));
    }

    for (const { projectTitle, workflowName, error } of errors) {
        console.info(
            chalk.bgRed(` ${projectTitle} - ${workflowName} `) + ' ' + chalk.gray(error.message.split('\n')[0]),
        );
    }
}

/**
 * TODO: Maybe use nodegit
 * TODO: !!! Auto clone repos before run
 */
