#!/usr/bin/env ts-node

import chalk from 'chalk';
import { spawn } from 'child_process';
import { readFile, writeFile } from 'fs/promises';
import glob from 'glob-promise';
import { locateVSCode } from 'locate-app';
import { basename, join } from 'path';
import { PackageJson, Promisable } from 'type-fest';
import { commit } from './utils/commit';
import { execCommand } from './utils/execCommand/execCommand';
import { findAllProjects } from './utils/findAllProjects';
import { findProjectName } from './utils/findProjectName';
import { findProjectTitle } from './utils/findProjectTitle';
import { forPlay } from './utils/forPlay';
import { isFileExisting } from './utils/isFileExisting';
import { isProjectArchived } from './utils/isProjectArchived';
import { isProjectFork } from './utils/isProjectFork';
import { isWorkingTreeClean } from './utils/isWorkingTreeClean';
import { isWorkingTreeInMergeProgress } from './utils/isWorkingTreeInMergeProgress';
import { colorSquare } from './utils/random/getColorSquare';
import { WORKFLOWS } from './workflows/workflows';

interface IRunWorkflowsOptions {
    runWorkflows: string[] | true;
    runProjects: string[] | true;
}

export async function runWorkflows({ runWorkflows, runProjects }: IRunWorkflowsOptions) {
    const errors: { tag: string; projectTitle: string; workflowName: string; error: Error }[] = [];
    const changedProjects: { projectTitle: string; projectUrl: URL; workflowNames: string[] }[] = [];

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
            const workflowName = workflow.name;

            // console.log({ workflows: workflowName }, runWorkflows !== true && !runWorkflows.includes(workflowName));
            if (runWorkflows !== true && !runWorkflows.includes(workflowName)) {
                continue;
            }

            await forPlay();

            const projectTitle = await findProjectTitle(projectPath);
            const { name: projectName, org: projectOrg, url: projectUrl } = await findProjectName(projectPath);

            try {
                if (await isProjectArchived(projectUrl)) {
                    console.info(
                        chalk.gray(`⏩ Skipping project ${projectTitle} because the project is archved on GitHub`),
                    );
                    continue;
                }

                if (await isProjectFork(projectUrl)) {
                    console.info(
                        chalk.gray(`⏩ Skipping project ${projectTitle} because the project is just a fork on GitHub`),
                    );
                    continue;
                }

                let currentBranch = await execCommand({
                    command: 'git branch --show-current',
                    cwd: projectPath,
                });

                if (!(await isWorkingTreeClean(projectPath))) {
                    if (!(await isWorkingTreeInMergeProgress(projectPath))) {
                        console.info(
                            chalk.gray(`⏩ Skipping project ${projectTitle} because working dir is not clean`),
                        );
                    } else {
                        console.info(
                            chalk.gray(
                                `⏩ Opening project ${projectTitle} in vscode because there is merge in progress`,
                            ),
                        );

                        spawn(await locateVSCode(), [projectPath]);
                    }
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

                console.info(`🔼 Running workflow ${workflowName} for project ${projectTitle}`);

                await execCommand({
                    command: 'git pull',
                    crashOnError: false,
                    cwd: projectPath,
                });

                const configPath = join(projectPath, 'batch-project-editor.js');
                if (await isFileExisting(configPath)) {
                    const config = require(configPath);
                    if (config.ignoreWorkflows) {
                        if (config.ignoreWorkflows.includes(workflowName)) {
                            console.info(
                                chalk.gray(
                                    `⏩ Skipping workflow ${workflowName} for project ${projectTitle} because projects config ignores this workflow`,
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

                let isProjectChanged = false;
                function projectWasChanged(): void {
                    console.info(chalk.bgGray(`Project ${projectTitle} was changed with workflow ${workflowName}`));
                    isProjectChanged = true;
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
                    async commit(message: string) {
                        const isCommited = await commit({ projectPath, message, workflowName });

                        if (isCommited) {
                            projectWasChanged();
                        }
                    },
                    projectWasChanged,
                });

                if (!(await isWorkingTreeClean(projectPath))) {
                    console.info(
                        chalk.red(
                            `❗ Workflow ${workflowName} for the project ${projectTitle} ended with dirty working dir`,
                        ),
                    );
                    process.exit();
                }

                if (isProjectChanged) {
                    const project = changedProjects.find(
                        ({ projectTitle: projectTitle2 }) => projectTitle === projectTitle2,
                    );

                    if (project) {
                        project.workflowNames.push(workflowName);
                    } else {
                        changedProjects.push({ projectTitle, projectUrl, workflowNames: [workflowName] });
                    }
                }
            } catch (error) {
                const tag = `[${colorSquare.next().value}]`;
                console.info(tag);
                console.error(error);
                errors.push({ tag, projectTitle, workflowName: workflowName, error });
            }
        }
    }

    if (errors.length > 0) {
        // Note: Making space above the full error report
        console.info(``);
        console.info(``);
        console.info(``);
        for (const { tag, projectTitle, workflowName, error } of errors) {
            console.info(tag + chalk.bgRed(error.name) + chalk.red(` ${projectTitle} - ${workflowName} `));
            console.error(error);
        }
    }

    // Note: Making space above the result
    console.info(``);
    console.info(``);
    console.info(``);
    console.info(
        changedProjects.length === 0
            ? chalk.bgCyan(`No project has changed.`)
            : chalk.bgGreen(`Changed ${changedProjects.length} projects:`),
    );

    for (const { projectTitle, projectUrl, workflowNames } of changedProjects) {
        console.info(
            `${chalk.bgGreen(` ${projectTitle} `)} ${chalk.green(workflowNames.join(', '))} ${chalk.gray(
                projectUrl.href,
            )}`,
        );
        // TODO: Show workflow by emojis not loooong names
    }

    for (const { tag, projectTitle, workflowName, error } of errors) {
        console.info(
            tag +
                chalk.bgRed(error.name) +
                chalk.red(` ${projectTitle} - ${workflowName} `) +
                ' ' +
                chalk.gray(error.message.split('\n')[0]),
        );
    }
}

/**
 * TODO: Maybe use nodegit
 * TODO: !!! Auto clone repos before run
 */
