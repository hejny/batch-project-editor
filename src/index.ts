#!/usr/bin/env ts-node

import chalk from 'chalk';
import commander from 'commander';
import { mkdir } from 'fs/promises';
import { basename, join } from 'path';
import spaceTrim from 'spacetrim';
import { BASE_PATH } from './config';
import { declareGlobals } from './globals';
import { runWorkflows } from './runWorkflows';
import { execCommand } from './utils/execCommand/execCommand';
import { findAllProjectsRemote } from './utils/findAllProjectsRemote';
import { isDirectoryExisting } from './utils/isDirectoryExisting';
import { isProjectArchived } from './utils/isProjectArchived';
import { isProjectFork } from './utils/isProjectFork';
import { isProjectPrivate } from './utils/isProjectPrivate';
import { patternToRegExp } from './utils/patternToRegExp';

declareGlobals();
main();

async function main() {
    const program = new commander.Command();
    program.option('--list-remote', `List all projects from GitHub`, false);
    program.option('--clone', `Clone all projects`, false);
    program.option('--edit', `Run batch edit of projects; Note: Specify --workflows and --projects`, false);
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
            Which of the projects to run during --edit
            Use % as a wildcard
            Note: [🥀] Using % not * as a wildcard char because of strange behavior of (probably) commander.js
        `),
        '%',
    );

    program.parse(process.argv);
    const { listRemote, clone, edit, workflows, projects } = program.opts();

    //----------------------------------
    if (listRemote) {
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

                await execCommand({
                    cwd,
                    command: `git clone ${projectUrl}`,
                    crashOnError: false,
                });
                await execCommand({
                    cwd: join(cwd, projectUrl.href.split('/').pop()!),
                    command: `npm ci`,
                    crashOnError: false,
                });
            }
        }
    }
    //----------------------------------

    //----------------------------------
    if (edit) {
        await runWorkflows({
            runWorkflows: patternToRegExp(...workflows.split(',')),
            runProjects: patternToRegExp(...projects.split(',')),
        });
    }
    //----------------------------------

    process.exit(0);
}
