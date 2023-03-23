import chalk from 'chalk';
import { spawn } from 'child_process';
import { mkdir, readFile, writeFile } from 'fs/promises';
import glob from 'glob-promise';
import { locateVSCode } from 'locate-app';
import { basename, dirname, join } from 'path';
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
    isDirtyCwdAllowed: boolean;
    branch: string;
}

export async function runWorkflows({
    isLooping,
    runWorkflows,
    runProjects,
    isDirtyCwdAllowed,
    branch: expectedBranch,
}: IRunWorkflowsOptions) {
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
    await forTime(1000 * 1 /* Wait 1 second before start */);
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
                            if (!isDirtyCwdAllowed) {
                                // TODO: Probbably use standard skippingOfBecause
                                console.info(
                                    chalk.gray(`⏩ Skipping project ${projectTitle} because working dir is not clean`),
                                );
                            }
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

                    if (currentBranch === 'master') {
                        currentBranch = 'main';
                    } /* not else */
                    if (currentBranch !== expectedBranch) {
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

                    console.info(`🔼 Running workflow ${workflowName} for project ${projectTitle}`);

                    await execCommand({
                        command: 'git pull',
                        crashOnError: false,
                        cwd: projectPath,
                    });

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

                    const configPath = join(projectPath, 'batch-project-editor.js');
                    if (await isFileExisting(configPath)) {
                        try {
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
                        } catch (error) {
                            console.error(error);
                        }
                    }

                    async function modifyFile(
                        filePath: string,
                        fileModifier: (fileContent: string | null) => Promisable<string | null>,
                    ): Promise<void> {
                        // TODO: DRY modifyFile, modifyFiles

                        filePath = join(projectPath, filePath);

                        let oldFileContent: string | null;

                        if (!(await isFileExisting(filePath))) {
                            oldFileContent = null;
                        } else {
                            oldFileContent = await readFile(filePath, 'utf8');

                            if (oldFileContent.includes(`@batch-project-editor ignore`)) {
                                console.info(`⏩ Skipping file ${filePath} because ignore tag is present`);
                                return;
                            }
                        }

                        const newFileContent = await fileModifier(oldFileContent);

                        if (newFileContent === null) {
                            // TODO: Maybe here delete the file if exists
                            console.info(`⬜ Keeping file ${filePath}`);
                        } else if (newFileContent !== oldFileContent) {
                            console.info(`💾 Changing file ${filePath}`);
                            await mkdir(dirname(filePath), {
                                recursive: true,
                            });
                            await writeFile(filePath, newFileContent);
                        } else {
                            console.info(`⬜ Keeping file ${filePath}`);
                        }
                    }

                    async function modifyFiles(
                        globPattern: string,
                        fileModifier: (filePath: string, fileContent: string) => Promisable<string | null>,
                    ): Promise<void> {
                        // TODO: DRY modifyFile, modifyFiles

                        for (const filePath of await glob(join(projectPath, globPattern), {
                            dot: true,
                            ignore: ['**/node_modules/**', '**/.git/**'],
                        })) {
                            const fileContent = await readFile(filePath, 'utf8');

                            if (fileContent.includes(`@batch-project-editor ignore`)) {
                                console.info(`⏩ Skipping file ${filePath} because ignore tag is present`);
                                continue;
                            }

                            const newFileContent = await fileModifier(filePath, fileContent);

                            if (newFileContent === null) {
                                console.info(`⬜ Keeping file ${filePath}`);
                            } else if (fileContent !== newFileContent) {
                                console.info(`💾 Changing file ${filePath}`);
                                await writeFile(filePath, newFileContent);
                            } else {
                                console.info(`⬜ Keeping file ${filePath}`);
                            }
                        }
                    }

                    async function readProjectFile(filePath: string): Promise<string> {
                        let content = await readFile(join(projectPath, filePath), 'utf8');
                        content = content.split(`\r\n`).join('\n');
                        return content;
                    }

                    // TODO: DRY all modify files utils - maybe refactor by AI

                    async function modifyJsonFile<T extends object>(
                        filePath: string,
                        fileModifier: (fileContent: T | null) => Promisable<T | null>,
                    ): Promise<void> {
                        filePath = join(projectPath, filePath);

                        let oldFileContent: T | null;

                        if (!(await isFileExisting(filePath))) {
                            oldFileContent = null;
                        } else {
                            const oldFileContentString = await readFile(filePath, 'utf8');

                            if (oldFileContentString.includes(`@batch-project-editor ignore`)) {
                                console.info(`⏩ Skipping file ${filePath} because ignore tag is present`);
                                return;
                            }

                            oldFileContent = JSON.parse(oldFileContentString);
                        }

                        const newFileContent = await fileModifier(oldFileContent);

                        if (newFileContent === null) {
                            // TODO: Maybe here delete the file if exists
                            console.info(`⬜ Keeping JSON file ${filePath}`);
                        } else if (JSON.stringify(newFileContent) !== JSON.stringify(oldFileContent)) {
                            console.info(`💾 Changing JSON file ${filePath}`);
                            await mkdir(dirname(filePath), {
                                recursive: true,
                            });
                            await writeFile(filePath, JSON.stringify(newFileContent, null, 4) + '\n');
                        } else {
                            console.info(`⬜ Keeping JSON file ${filePath}`);
                        }
                    }

                    function modifyJsonFiles<T extends object>(
                        globPattern: string,
                        fileModifier: (filePath: string, fileContent: T) => Promisable<T | null>,
                    ): Promise<void> {
                        return modifyFiles(globPattern, async (filePath, oldContentString) => {
                            let oldContent = JSON.parse(oldContentString);
                            let newContent = await fileModifier(filePath, oldContent);

                            if (!newContent) {
                                // Note: fileModifier can just mutate the content and return nothing - so grabbing mutated oldContent
                                newContent = oldContent;
                            }

                            // Note: Parsing once again because fileModifier can mutate the content and we need here real old content of the file
                            oldContent = JSON.parse(oldContentString);

                            // console.log({ oldContent, newContent });

                            if (JSON.stringify(oldContent) === JSON.stringify(newContent)) {
                                // Note: Do not re-format the file when nothing changed
                                console.info(
                                    `⏩ Not changing JSON file ${basename(
                                        filePath,
                                    )} because JSON contents does not changed and we do not want to do the re-format of the file`,
                                );
                                return oldContentString;
                            }

                            return JSON.stringify(newContent, null, 4) + '\n';
                        });
                    }

                    const packageJson = await readFile(join(projectPath, 'package.json'), 'utf8')
                        .then((packageContent) => JSON.parse(packageContent))
                        // !!! Comment and keep only for testing
                        .catch(() => ({
                            // Note: When the package.json is corrupted then pass empty object
                        }));
                    const readmeContent = await readFile(join(projectPath, 'README.md'), 'utf8');

                    function modifyPackage(
                        fileModifier: (packageContent: PackageJson) => Promisable<PackageJson>,
                    ): Promise<void> {
                        return modifyJsonFiles<PackageJson>('package.json', (filePath, packageJson) =>
                            fileModifier(packageJson),
                        );
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
                        readmeContent,
                        mainBranch: currentBranch,
                        execCommandOnProject,
                        readFile: readProjectFile,
                        modifyFile,
                        modifyFiles,
                        modifyJsonFile,
                        modifyJsonFiles,
                        modifyPackage,
                        madeSideEffect(whatWasDoneDescription: string) {
                            console.info(
                                chalk.green(
                                    `👨‍🏭 Workflow ${workflowName} on project ${projectTitle} ${whatWasDoneDescription}`,
                                ),
                            );
                            return WorkflowResult.SideEffect;
                        },
                        skippingBecauseOf(reasonToSkipDescription: string) {
                            console.info(
                                chalk.gray(
                                    `⏩ Skipping workflow ${workflowName} on project ${projectTitle} because of ${reasonToSkipDescription}`,
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
