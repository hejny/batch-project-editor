#!/usr/bin/env ts-node

import chalk from 'chalk';
import commander from 'commander';
import { mkdir } from 'fs/promises';
import { basename, join } from 'path';
import spaceTrim from 'spacetrim';
import { BASE_PATH } from './config';
import { declareGlobals } from './globals';
import { runAggregators } from './runAggregators';
import { runWorkflows } from './runWorkflows';
import { execCommand } from './utils/execCommand/execCommand';
import { findAllProjects } from './utils/findAllProjects';
import { findAllProjectsRemote } from './utils/findAllProjectsRemote';
import { createNewRepository } from './utils/github-publish/createNewRepository';
import { isDirectoryExisting } from './utils/isDirectoryExisting';
import { isProjectArchived } from './utils/isProjectArchived';
import { isProjectFork } from './utils/isProjectFork';
import { isProjectPrivate } from './utils/isProjectPrivate';
import { patternToRegExp } from './utils/patternToRegExp';
import { WORKFLOWS } from './workflows/workflows';

declareGlobals();
main();

async function main() {
    const program = new commander.Command();
    program.option('--list-remote-projects', `List all projects from GitHub`, false);
    program.option('--list-projects', `List all local projects`, false);
    program.option('--list-workflows', `List all workflows`, false);
    program.option('--clone', `Clone all projects`, false);
    program.option('--create <repositoryName>', `Create new repository`);
    program.option('--edit', `Run batch edit of projects; Note: Specify --workflows and --projects`, false);
    program.option('--aggregate', `Run aggregation; Note: Specify --aggregators and --projects`, false);
    program.option('--loop', `Should be looping after few minutes during --edit`, false);
    program.option(
        '--branch <branch>',
        spaceTrim(`
            What branch to checkout during --edit
            Note: "main" also covers "master"
        `),
        'main',
    );
    program.option(
        '--allow-dirty-cwd',
        spaceTrim(`
            Allow uncommited  changes during --edit
            Warning: Theese changes will be included in whatever commit BPE makes
        `),
        false,
    );
    program.option(
        '--workflows <workflows>',
        spaceTrim(`
            Which of thr workflows to run during --edit
            Use % as a wildcard
            Note: [🥀] Using % not * as a wildcard char because of strange behavior of (probably) commander.js
        `),
        '%',
    );
    program.option(
        '--projects <projects>',
        spaceTrim(`
            Which of the projects to run during --edit or --aggregate
            Use % as a wildcard
            Note: [🥀] Using % not * as a wildcard char because of strange behavior of (probably) commander.js
        `),
        '%',
    );
    program.option('--aggregator <aggregator>', `Which aggregator to run during --aggregate`, '%');

    program.parse(process.argv);
    const {
        listRemoteProjects,
        listProjects,
        listWorkflows,
        clone,
        create,
        edit,
        aggregate,
        loop,
        workflows,
        projects,
        aggregator,
        branch,
        allowDirtyCwd,
    } = program.opts();

    //----------------------------------
    if (create) {
        await createNewRepository({ organizationName: '1-2i' /* <- TODO: Unhardcode */, repositoryName: create });
    }
    //----------------------------------

    //----------------------------------
    if (listRemoteProjects) {
        for (const [org, projectUrls] of Object.entries(await findAllProjectsRemote())) {
            console.info(chalk.bgYellowBright(` 🏛️  ${org} `));
            for (const projectUrl of projectUrls) {
                const isPrivate = await isProjectPrivate(projectUrl);
                const isArchived = await isProjectArchived(projectUrl);
                const isFork = await isProjectFork(projectUrl);
                console.info(
                    chalk.cyan(projectUrl) +
                        ' ' +
                        (!isPrivate ? '' : chalk.bgMagenta(' 🔒  PRIVATE ')) +
                        (!isArchived ? '' : chalk.bgGray(' 🗃️  ARCHIVED ')) +
                        (!isFork ? '' : chalk.bgBlue(' 🍴  FORK ')),
                );
            }
        }
    }
    //----------------------------------

    //----------------------------------
    if (listProjects) {
        for (const projectPath of await findAllProjects()) {
            console.info(chalk.bgYellowBright(` 🏤  ${projectPath} `));
        }
    }
    //----------------------------------

    //----------------------------------
    if (listWorkflows) {
        for (const workflow of WORKFLOWS) {
            console.info(chalk.bgYellowBright(` ⚙️  ${workflow.name} `));
        }
    }
    //----------------------------------

    //----------------------------------
    if (clone) {
        for (const [org, projectUrls] of Object.entries(await findAllProjectsRemote())) {
            const cwd = join(BASE_PATH, org);
            await mkdir(cwd, { recursive: true });
            for (const projectUrl of projectUrls) {
                const projectName = basename(projectUrl.href);
                if (await isDirectoryExisting(join(cwd, projectName))) {
                    console.info(
                        chalk.gray(`⏩ Skipping clonning of project ${projectName} because it already exists`),
                    );
                    continue;
                }

                if (await isProjectArchived(projectUrl)) {
                    console.info(
                        chalk.gray(`⏩ Skipping project ${projectName} because the project is archived on GitHub`),
                    );
                    continue;
                }

                if (await isProjectFork(projectUrl)) {
                    console.info(
                        chalk.gray(`⏩ Skipping project ${projectName} because the project is just a fork on GitHub`),
                    );
                    continue;
                }

                // TODO: [🏴󠁧󠁢󠁥󠁮󠁧󠁿] Exclude projects

                await execCommand({
                    cwd,
                    command: `git clone ${projectUrl}`,
                    crashOnError: false,
                });
                await execCommand({
                    cwd: join(cwd, projectUrl.href.split('/').pop()!),
                    command: `pnpm i --frozen-lockfile`,
                    crashOnError: false,
                });
            }
        }
    }
    //----------------------------------

    //----------------------------------
    if (edit) {
        await runWorkflows({
            isLooping: loop,
            runWorkflows: patternToRegExp(...workflows.split(',')),
            runProjects: patternToRegExp(...projects.split(',')),
            branch,
            isDirtyCwdAllowed: allowDirtyCwd,
        });
    }
    //----------------------------------

    //----------------------------------
    if (aggregate) {
        await runAggregators({
            isLooping: loop,
            runAggregator: aggregator,
            runProjects: patternToRegExp(...projects.split(',')),
        });
    }
    //----------------------------------

    process.exit(0);
}
