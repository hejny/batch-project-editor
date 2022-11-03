import chalk from 'chalk';
import { spawn } from 'child_process';
import { readFile, writeFile } from 'fs/promises';
import glob from 'glob-promise';
import { locateVSCode } from 'locate-app';
import { basename, join } from 'path';
import { PackageJson, Promisable } from 'type-fest';
import { forTime } from 'waitasecond';
import { LOOP_INTERVAL } from './config';
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
import { WorkflowResult } from './workflows/IWorkflow';
import { WORKFLOWS } from './workflows/workflows';

interface IRunWorkflowsOptions {
    isLooping: boolean;
    runWorkflows: RegExp;
    runProjects: RegExp;
}

export async function runWorkflows({ isLooping, runWorkflows, runProjects }: IRunWorkflowsOptions) {
    // TODO: DRY Interfaces
    const errors: {
        tag: string;
        projectTitle: string;
        projectUrl: URL;
        projectPath: string;
        workflowName: string;
        error: Error;
    }[] = [];
    const changedProjects: { projectTitle: string; projectUrl: URL; workflowNames: string[] }[] = [];

    const allProjects = await findAllProjects();
    const filteredProjects = allProjects.filter((project) => runProjects.test(basename(project)));
    const sortedProjects = filteredProjects; /* TODO: .reverse( Reverse + shuffle as CLI flag ) */

    const filteredWorkflows = WORKFLOWS.filter((workflow) => runWorkflows.test(workflow.name));
    const sortedWorkflows = filteredWorkflows;

    // ----------------------- Log what is going to happen ---

    console.info(``);
    console.info(``);
    console.info(chalk.bgGreen(` ⚙️  Running ${sortedWorkflows.length} workflows `));
    for (const workflow of sortedWorkflows) {
        console.info(chalk.green(` ${workflow.name} `));
    }
    console.info(``);
    console.info(``);
    console.info(chalk.bgBlue(` 🏤  Running ${sortedProjects.length} projects `));
    for (const project of sortedProjects) {
        console.info(chalk.blue(` ${basename(project)} `));
    }
    console.info(``);
    console.info(``);
    await forTime(1000 * 5);
    // ----------------------- Initialize ---

    for (const workflow of sortedWorkflows) {
        const workflowName = workflow.name;

        if (workflow.initialize) {
            console.info(chalk.bgMagenta(` 🚀  Initializing ${workflowName} `));
            await workflow.initialize();
        }
    }

    // ----------------------- Do the job ---

    while (true) {
        for (const projectPath of sortedProjects) {
            for (const workflow of sortedWorkflows) {
                await forPlay();

                // ----------------------- Prepare the utils ---

                const workflowName = workflow.name;

                const projectTitle = await findProjectTitle(projectPath);
                const { name: projectName, org: projectOrg, url: projectUrl } = await findProjectName(projectPath);

                try {
                    if (await isProjectArchived(projectUrl)) {
                        // TODO: Probbably use standard skippingOfBecause
                        console.info(
                            chalk.gray(`⏩ Skipping project ${projectTitle} because the project is archived on GitHub`),
                        );
                        continue;
                    }

                    if (await isProjectFork(projectUrl)) {
                        // TODO: Probbably use standard skippingOfBecause
                        console.info(
                            chalk.gray(
                                `⏩ Skipping project ${projectTitle} because the project is just a fork on GitHub`,
                            ),
                        );
                        continue;
                    }

                    let currentBranch = await execCommand({
                        command: 'git branch --show-current',
                        cwd: projectPath,
                    });

                    if (!(await isWorkingTreeClean(projectPath))) {
                        if (!(await isWorkingTreeInMergeProgress(projectPath))) {
                            // TODO: Probbably use standard skippingOfBecause
                            console.info(
                                chalk.gray(`⏩ Skipping project ${projectTitle} because working dir is not clean`),
                            );
                        } else {
                            console.info(
                                chalk.gray(
                                    `⏩ Opening project ${projectTitle} in VSCode because there is merge in progress`,
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
                            // TODO: Probbably use standard skippingOfBecause
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
                        // TODO: Probbably use standard skippingOfBecause
                        console.info(
                            chalk.gray(`⏩ Skipping project ${projectTitle} because package.json does not exist`),
                        );
                        continue;
                    }

                    if (!(await isFileExisting(join(projectPath, 'README.md')))) {
                        // TODO: Probbably use standard skippingOfBecause
                        console.info(
                            chalk.gray(`⏩ Skipping project ${projectTitle} because README.md does not exist`),
                        );
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
                                // TODO: Probbably use standard skippingOfBecause
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

                    function execCommandOnProject(command: string) {
                        return execCommand({
                            command,
                            cwd: projectPath,
                        });
                    }

                    // ----------------------- Do the job ---

                    const result = await workflow({
                        projectTitle,
                        projectPath,
                        projectName,
                        projectUrl,
                        projectOrg,
                        packageJson,
                        mainBranch: currentBranch as 'main' | 'master',
                        execCommandOnProject,
                        readFile: readProjectFile,
                        modifyFiles,
                        modifyJsonFiles,
                        modifyPackage,
                        skippingBecauseOf(message) {
                            console.info(
                                chalk.gray(
                                    `⏩ Skipping workflow ${workflowName} on project ${projectTitle} because of ${message}`,
                                ),
                            );
                            return WorkflowResult.Skip;
                        },
                        async commit(message: string) {
                            const isCommited = await commit({ projectPath, message, workflowName });
                            return isCommited ? WorkflowResult.Change : WorkflowResult.NoChange;
                        },
                    });

                    // ----------------------- After the job ---

                    if (!(await isWorkingTreeClean(projectPath))) {
                        // TODO: Probbably make as standard error
                        console.info(
                            chalk.red(
                                `❗ Workflow ${workflowName} for the project ${projectTitle} ended with dirty working dir`,
                            ),
                        );
                        process.exit();
                    }

                    if (result === WorkflowResult.Change || result === WorkflowResult.SideEffect) {
                        console.info(chalk.bgGray(`Project ${projectTitle} was changed with workflow ${workflowName}`));

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
                    errors.push({ tag, projectTitle, workflowName, projectUrl, projectPath, error });
                }
            }
        }

        // ----------------------- Show the result ---

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

        for (const { tag, projectTitle, projectPath, workflowName, error } of errors) {
            console.info(
                tag +
                    chalk.bgRed(error.name) +
                    ' ' +
                    chalk.bold(chalk.blueBright(projectTitle)) +
                    ' ' +
                    chalk.blueBright(workflowName) +
                    ' ' +
                    chalk.red(
                        error.message
                            .split('\n')[0]
                            .split(/Error:?/g)
                            .join('')
                            .trim(),
                    ) +
                    ' ' +
                    chalk.gray(projectPath),
            );
        }

        if (!isLooping) {
            return;
        } else {
            console.info(chalk.gray(`➰ Looping again in ${LOOP_INTERVAL / 1000} seconds`));
            await forTime(LOOP_INTERVAL);
        }
    }
}

/**
 * TODO: Simplyfy this file (maybe make some utils Class) and DRY runWorkflows + runAggregators
 * TODO: When looping DO not report some project 2x
 * TODO: Maybe use nodegit
 */
