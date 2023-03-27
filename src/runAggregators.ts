import chalk from 'chalk';
import { readFile } from 'fs/promises';
import { basename, join } from 'path';
import { forTime } from 'waitasecond';
import { AGGREGATORS } from './aggregators/aggregators';
import { execCommand } from './utils/execCommand/execCommand';
import { findAllProjects } from './utils/findAllProjects';
import { findProjectName } from './utils/findProjectName';
import { findProjectTitle } from './utils/findProjectTitle';
import { forPlay } from './utils/forPlay';
import { isFileExisting } from './utils/isFileExisting';

interface IRunAggregatorsOptions {
    isLooping: boolean;
    runAggregator: string;
    runProjects: RegExp;
}

export async function runAggregators({ isLooping, runAggregator, runProjects }: IRunAggregatorsOptions) {
    // TODO: DRY Interfaces

    const aggregatorName = runAggregator;
    const allProjects = await findAllProjects();
    const filteredProjects = allProjects.filter((project) => runProjects.test(basename(project)));
    const sortedProjects = filteredProjects; /* TODO: .reverse( Reverse + shuffle as CLI flag ) */
    const aggregator = AGGREGATORS.find((aggregator) => aggregator.constructor.name === aggregatorName);

    if (!aggregator) {
        // TODO: Decide if to throw errors or report by console.info with red chalk
        // TODO: List all available aggregators
        throw new Error(`There is no aggregator "${aggregatorName}"`);
    }

    // ----------------------- Log what is going to happen ---

    console.info(``);
    console.info(``);
    console.info(chalk.bgBlue(` ➕ Aggregating ${aggregatorName} for ${sortedProjects.length} projects `));
    for (const project of sortedProjects) {
        console.info(chalk.blue(` ${basename(project)} `));
    }
    console.info(``);
    console.info(``);
    await forTime(1000 * 1);
    await forPlay();

    // ----------------------- Do the aggregation ---
    const projectResults: Array<{ projectTitle: string; result: any }> = [];
    for (const projectPath of sortedProjects) {
        await forPlay();

        // ----------------------- Prepare the utils ---

        const projectTitle = await findProjectTitle(projectPath);
        const { name: projectName, org: projectOrg, url: projectUrl } = await findProjectName(projectPath);

        let currentBranch = await execCommand({
            command: 'git branch --show-current',
            cwd: projectPath,
        });

        /*
        Note: Kepping for [👊] use it in checkoutMainBranch
        if (currentBranch !== 'main' && currentBranch !== 'master') {


            console.info(`👉 Switching from branch ${currentBranch} to main.`);

            const result = await execCommand({
                command: 'git switch main',
                cwd: projectPath,
                crashOnError: false,
            });

            if (!result.includes(`Switched to branch 'main'`)) {
                console.info(chalk.gray(`⏩ Skipping project ${projectTitle} because can not switch to main branch`));
                continue;
            }

            currentBranch = 'main';

            /*
            console.info(
                `⏩ Skipping project ${projectTitle} because current branch is not main (or master) but ${currentBranch}.`,
            );
            continue;
            * /
        }
        */

        if (!(await isFileExisting(join(projectPath, 'package.json')))) {
            // TODO: [🐎] Maybe not nessesary
            console.info(chalk.gray(`⏩ Skipping project ${projectTitle} because package.json does not exist`));
            continue;
        }

        if (!(await isFileExisting(join(projectPath, 'README.md')))) {
            // TODO: [🐎] Maybe not nessesary
            console.info(chalk.gray(`⏩ Skipping project ${projectTitle} because README.md does not exist`));
            continue;
        }

        console.info(`🔼 Running aggregate ${aggregatorName} for project ${projectTitle}`);

        await execCommand({
            command: 'git pull',
            crashOnError: false,
            cwd: projectPath,
        });

        function readProjectFile(filePath: string): Promise<string> {
            return readFile(join(projectPath, filePath), 'utf8');
            // TODO: Warn if here is CRLF (\r\n)
        }

        const packageJson = JSON.parse(await readFile(join(projectPath, 'package.json'), 'utf8'));
        const readmeContent = await readFile(join(projectPath, 'README.md'), 'utf8');

        function execCommandOnProject(command: string) {
            return execCommand({
                command,
                cwd: projectPath,
            });
        }

        // ----------------------- Do the job ---

        const result = await aggregator.run({
            projectTitle,
            projectPath,
            projectName,
            projectUrl,
            projectOrg,
            packageJson,
            readmeContent,
            currentBranch: currentBranch as 'main' | 'master',
            execCommandOnProject,
            readFile: readProjectFile,
        });

        projectResults.push({ projectTitle, result });
    }

    const aggregated = projectResults
        .map(({ result }) => result)
        .reduce((aggregated, result) => aggregator.join(aggregated, result), aggregator.initial);

    // ----------------------- Show the result ---

    // Note: Making space above the result
    console.info(`________________________`);
    console.info(``);
    console.info(``);
    console.info(``);

    for (const { projectTitle, result } of projectResults) {
        console.info(chalk.bgCyan(`  🏤  Project ${projectTitle}:  `));
        console.info(aggregator.print(result));
    }

    console.info(chalk.bgGreen(`  ➕  Aggregated:  `));
    // TODO: Allow to save to file AND open HTML report page
    console.info(aggregator.print(aggregated));
}

/**
 * TODO: Simplyfy this file (maybe make some utils Class) and DRY runWorkflows + runAggregators
 * TODO: Maybe use nodegit
 */
