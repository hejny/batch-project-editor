#!/usr/bin/env ts-node

import chalk from 'chalk';
import commander from 'commander';
import { mkdir } from 'fs/promises';
import { basename, join } from 'path';
import { BASE_PATH } from './config';
import { runWorkflows } from './runWorkflows';
import { execCommand } from './utils/execCommand/execCommand';
import { findAllProjectsRemote } from './utils/findAllProjectsRemote';
import { isDirectoryExisting } from './utils/isDirectoryExisting';

main();

async function main() {
    const program = new commander.Command();
    program.option('--list', `List all projects`);
    program.option('--clone', `Clone all projects`);
    program.option('--workflows <workflows>', `Run the workflows`, 'all');
    program.option('--projects <projects>', `Run the projects`, 'all');

    program.parse(process.argv);
    const { list, clone, workflows, projects } = program.opts();
    // console.log({ list, clone, workflows, projects });

    if (list) {
        for (const [org, projectUrls] of Object.entries(await findAllProjectsRemote())) {
            console.info(chalk.bgYellowBright(org));
            for (const projectUrl of projectUrls) {
                console.info(chalk.bgGreen(projectUrl));
            }
        }
    } else if (clone) {
        for (const [org, projectUrls] of Object.entries(await findAllProjectsRemote())) {
            const cwd = join(BASE_PATH, org);
            await mkdir(cwd, { recursive: true });
            for (const projectUrl of projectUrls) {
                const projectName = basename(projectUrl);
                if (await isDirectoryExisting(join(cwd, projectName))) {
                    console.info(
                        chalk.gray(`⏩ Skipping clonning of project ${projectName} because it already exists`),
                    );
                    continue;
                }

                await execCommand({
                    cwd,
                    command: `git clone ${projectUrl}`,
                    crashOnError: false,
                });
                await execCommand({
                    cwd: join(cwd, projectUrl.split('/').pop()!),
                    command: `npm ci`,
                    crashOnError: false,
                });
            }
        }
    } else if (workflows) {
        await runWorkflows({
            runWorkflows: workflows === 'all' ? true : workflows.split(','),
            runProjects: projects === 'all' ? true : projects.split(','),
        });
    } else {
        console.info(chalk.bgRed(`No action specified`));
    }
}
