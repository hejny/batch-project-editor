#!/usr/bin/env ts-node

import chalk from 'chalk';
import commander from 'commander';
import { mkdir } from 'fs/promises';
import { join } from 'path';
import { BASE_PATH } from './config';
import { runWorkflows } from './runWorkflows';
import { execCommand } from './utils/execCommand/execCommand';
import { findAllProjectsRemote } from './utils/findAllProjectsRemote';

main();

async function main() {
    const program = new commander.Command();
    program.option('--list', `List all projects`);
    program.option('--clone', `Clone all projects`);
    program.option('--workflows', `Run the workflows`);

    program.parse(process.argv);
    const { list, clone, workflows } = program.opts();

    if (workflows) {
        await runWorkflows();
    } else if (list) {
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
    } else {
        console.info(chalk.bgRed(`No action specified`));
    }
}
