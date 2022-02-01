import glob from 'glob-promise';
import { basename, join } from 'path';
import spaceTrim from 'spacetrim';
import YAML from 'yaml';
import { isFileExisting } from '../../utils/isFileExisting';
import { IWorkflowOptions } from '../IWorkflow';

const BADGES = /<!--Badges-->(?<badges>.*)<!--\/Badges-->/is;

export async function badges({
    projectName,
    projectPath,
    projectOrg,
    modifyFiles,
    commit,
}: IWorkflowOptions): Promise<void> {
    const badges: Array<{
        title: string;
        imageSrc: string;
        href: string;
    }> = [];

    if (projectOrg === 'hejny' /* TODO: Bit hardcoded */) {
        badges.push({
            // TODO: !!! Use here some npm name not name
            // TODO: !!! Only for not scoped packages on NPM
            title: 'Package Quality',
            imageSrc: `https://packagequality.com/shield/${projectName}.svg`,
            href: `https://packagequality.com/#?package=${projectName}`,
        });
    }

    badges.push({
        title: 'License',
        imageSrc: `https://img.shields.io/github/license/${projectOrg}/${projectName}.svg?style=flat`,
        href: `https://raw.githubusercontent.com/${projectOrg}/${projectName}/master/LICENSE`,
    });

    badges.push({
        title: `NPM Version`,
        imageSrc: `https://badge.fury.io/js/@${projectOrg}%2F${projectName}.svg`,
        href: `https://www.npmjs.com/package/@${projectOrg}/${projectName}`,
    });

    for (const workflowPath of await glob(join(projectPath, '/.github/workflows/*.yml'), { dot: true })) {
        badges.push({
            title: YAML.parse(workflowPath).name,
            imageSrc: `https://github.com/${projectOrg}/${projectName}/actions/workflows/${basename(
                workflowPath,
            )}/badge.svg`,
            href: `https://github.com/${projectOrg}/${projectName}/actions/workflows/${basename(workflowPath)}.yml`,
        });
    }

    /*
    badges.push({
        title: `Test`,
        imageSrc: `https://github.com/${org}/${name}/actions/workflows/test.yml/badge.svg`,
        href: `https://github.com/${org}/${name}/actions/workflows/test.yml`,
    });

    badges.push({
        title: `Lint`,
        imageSrc: `https://github.com/${org}/${name}/actions/workflows/lint.yml/badge.svg`,
        href: `https://github.com/${org}/${name}/actions/workflows/lint.yml`,
    });
    */

    badges.push({
        title: `Known Vulnerabilities`,
        imageSrc: `https://snyk.io/test/github/${projectOrg}/${projectName}/badge.svg`,
        href: `https://snyk.io/test/github/${projectOrg}/${projectName}`,
    });

    badges.push({
        title: `Issues`,
        imageSrc: `https://img.shields.io/github/issues/${projectOrg}/${projectName}.svg?style=flat`,
        href: `https://github.com/${projectOrg}/${projectName}/issues`,
    });

    if (await isFileExisting(join(projectPath, 'cypress.json'))) {
        badges.push({
            title: `Cypress.io`,
            imageSrc: `https://img.shields.io/badge/tested%20with-Cypress-04C38E.svg`,
            href: `https://www.cypress.io/`,
        });
    }

    if (projectName === 'collboard' /* TODO: Bit hardcoded */) {
        badges.push({
            title: `IPv6 ready`,
            imageSrc: `http://ipv6-test.com/button-ipv6-80x15.png`,
            href: `http://ipv6-test.com/validate.php?url=collboard.com`,
        });
    }

    // TODO: !!! Test working of images and links

    const badgesMarkdown = spaceTrim(
        (block) => `
          <!--Badges-->

          ${block(badges.map(({ title, imageSrc, href }) => ` [![${title}](${imageSrc})](${href})`).join('\n'))}

          <!--/Badges-->
    `,
    );

    await modifyFiles('README.md', async (readmeContent) => {
        if (BADGES.test(readmeContent)) {
            return readmeContent.replace(BADGES, badgesMarkdown);
        } else {
            let added = false;
            return readmeContent
                .split('\n')
                .map((line) => {
                    if (!added && line.startsWith('#')) {
                        added = true;
                        return `${line}\n\n${badgesMarkdown}`;
                    }

                    return line;
                })
                .join('\n');
        }
    });

    await commit('📛 Update badges');
}

/**
 * Maybe use>  (?<=((?<heading>^#[^\n]*$)(\s*)(?<description>^.*?$)?(\n{2,})))
 */
