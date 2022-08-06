#!/usr/bin/env ts-node

import chalk from 'chalk';
import commander from 'commander';
import { mkdir } from 'fs/promises';
import { basename, join } from 'path';
import { BASE_PATH } from './config';
import { declareGlobals } from './globals';
import { runWorkflows } from './runWorkflows';
import { execCommand } from './utils/execCommand/execCommand';
import { findAllProjectsRemote } from './utils/findAllProjectsRemote';
import { isDirectoryExisting } from './utils/isDirectoryExisting';
import { isProjectArchived } from './utils/isProjectArchived';
import { isProjectFork } from './utils/isProjectFork';

declareGlobals();
main();

async function main() {
    const program = new commander.Command();
    program.option('--list-remote', `List all projects from GitHub`, false);
    program.option('--flags', `Modificator to list all projects from GitHub – listing with flags`, false);
    program.option('--clone', `Clone all projects`, false);
    program.option('--edit', `Run batch edit of projects; Note: Specify --workflows and --projects`, false);
    program.option('--workflows <workflows>', `Which of thr workflows to run during --edit`, 'all');
    program.option('--projects <projects>', `Which of the projects to run during --edit`, 'all');

    program.parse(process.argv);
    const { listRemote, flags, clone, edit, workflows, projects } = program.opts();

    //----------------------------------
    if (listRemote) {
        for (const [org, projectUrls] of Object.entries(await findAllProjectsRemote())) {
            console.info(chalk.bgYellowBright(org));
            for (const projectUrl of projectUrls) {
                const isArchived = flags && (await isProjectArchived(projectUrl));
                const isFork = flags && (await isProjectFork(projectUrl));
                console.info(
                    chalk.cyan(projectUrl) +
                        // TODO: Obtain information with findAllProjectsRemote> (!isPrivate ? '' : ' ' + chalk.bgGray(' PRIVATE ')) +
                        (!isArchived ? '' : ' ' + chalk.bgGray(' ARCHIVED ')) +
                        (!isFork ? '' : ' ' + chalk.bgBlue(' FORK ')),
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
                        chalk.gray(`⏩ Skipping project ${projectName} because the project is archved on GitHub`),
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
            runWorkflows: workflows === 'all' ? true : workflows.split(','),
            runProjects: projects === 'all' ? true : projects.split(','),
        });
    }
    //----------------------------------

    process.exit(0);
}
