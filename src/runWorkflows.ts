#!/usr/bin/env ts-node

import chalk from 'chalk';
import { readFile, writeFile } from 'fs/promises';
import glob from 'glob-promise';
import { basename, join } from 'path';
import spaceTrim from 'spacetrim';
import { PackageJson, Promisable } from 'type-fest';
import { WORKFLOWS } from './config';
import { execCommand } from './utils/execCommand/execCommand';
import { findAllProjects } from './utils/findAllProjects';
import { findProjectName } from './utils/findProjectName';
import { findProjectTitle } from './utils/findProjectTitle';
import { isFileExisting } from './utils/isFileExisting';
import { isWorkingTreeClean } from './utils/isWorkingTreeClean';

interface IRunWorkflowsOptions {
    runWorkflows: string[] | true;
    runProjects: string[] | true;
}

export async function runWorkflows({ runWorkflows, runProjects }: IRunWorkflowsOptions) {
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

            const projectTitle = await findProjectTitle(projectPath);
            const { name: projectName, org: projectOrg, url: projectUrl } = await findProjectName(projectPath);

            const currentBranch = await execCommand({
                command: 'git branch --show-current',
                cwd: projectPath,
            });

            if (currentBranch !== 'main' && currentBranch !== 'master') {
                console.info(
                    `⏩ Skipping project ${projectTitle} because current branch is not main (or master) but ${currentBranch}`,
                );
                continue;
            }

            if (!(await isWorkingTreeClean(projectPath))) {
                console.info(chalk.gray(`⏩ Skipping project ${projectTitle} because working dir is not clean`));
                continue;
            }

            if (!(await isFileExisting(join(projectPath, 'package.json')))) {
                console.info(chalk.gray(`⏩ Skipping project ${projectTitle} because package.json does not exist`));
                continue;
            }

            const configPath = join(projectPath, 'batch-project-editor.js');
            if (!(await isFileExisting(configPath))) {
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

            console.info(`🔼 Running workflow ${workflow.name} for project ${projectTitle}`);

            await execCommand({
                command: 'git pull',
                crashOnError: false,
                cwd: projectPath,
            });

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

            const packageJson = JSON.parse(await readFile(join(projectPath, 'package.json'), 'utf8'));
            function modifyPackage(
                fileModifier: (packageContent: PackageJson) => Promisable<PackageJson>,
            ): Promise<void> {
                return modifyFiles('package.json', async (fileContent) => {
                    const packageJson = JSON.parse(fileContent);
                    return JSON.stringify((await fileModifier(packageJson)) || packageJson, null, 2) + '\n';
                });
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
                branch: currentBranch,
                runCommand,
                readFile: readProjectFile,
                modifyFiles,
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
        }
    }

    console.info(chalk.bgGreen(`Changed ${changedProjects.length} projects:`));

    for (const { projectTitle, projectUrl } of changedProjects) {
        console.info(chalk.bgGreen(` ${projectTitle} `) + ' ' + chalk.gray(projectUrl.href));
    }
}

/**
 * TODO: Maybe use nodegit
 */
