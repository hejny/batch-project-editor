import glob from 'glob-promise';
import { basename, join } from 'path';
import spaceTrim from 'spacetrim';
import YAML from 'yaml';
import { findPackagePublished } from '../../utils/findPackagePublished';
import { isFileExisting } from '../../utils/isFileExisting';
import { isUrlExisting } from '../../utils/isUrlExisting';
import { IWorkflowOptions } from '../IWorkflow';

const BADGES = /<!--Badges-->(?<badges>.*)<!--\/Badges-->/is;

export async function badges({
    projectTitle,
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

    badges.push({
        title: `License of ${projectTitle}`,
        imageSrc: `https://img.shields.io/github/license/${projectOrg}/${projectName}.svg?style=flat`,
        href: `https://raw.githubusercontent.com/${projectOrg}/${projectName}/master/LICENSE`,
    });

    const published = await findPackagePublished({ projectOrg, projectName });
    if (published.npm) {
        badges.push({
            title: `NPM Version of ${projectTitle}`,
            imageSrc: `https://badge.fury.io/js/${published.npm.scope ? `@${published.npm.scope}%2F` : ''}${
                published.npm.name
            }.svg`,
            href: published.npm.url.href,
        });

        if (
            !published.npm.scope
            // Note: packagequality is working only for non-scoped packages
            //       @see https://github.com/alexfernandez/package-quality/issues/65
        ) {
            badges.push({
                title: `Quality of package ${projectTitle}`,
                imageSrc: `https://packagequality.com/shield/${published.npm.name}.svg`,
                href: `https://packagequality.com/#?package=${published.npm.name}`,
            });
        }
    }

    for (const workflowPath of await glob(join(projectPath, '/.github/workflows/*.yml'), { dot: true })) {
        const workflowName = basename(workflowPath).replace(/\.yml$/, '');

        if (workflowName === 'publish') {
            // Note: Publish status is shown in badge "NPM Version" above
            continue;
        }

        badges.push({
            title: YAML.parse(workflowPath).name || workflowName /* TODO: <- Capitalize first letter on workflowName */,
            imageSrc: `https://github.com/${projectOrg}/${projectName}/actions/workflows/${workflowName}.yml/badge.svg`,
            href: `https://github.com/${projectOrg}/${projectName}/actions/workflows/${workflowName}.yml`,
        });
    }

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
            href: `http://ipv6-test.com/validate.php?url=collboard.com` /* <- "collboard.com" is hardcoded */,
        });
    }

    //Note: Test working of images and links
    const imagesAndLinksCanBeLoaded = await Promise.all([
        ...badges.map(async (badge) => ({
            badgeTitle: badge.title,
            url: badge.href,
            exists: await isUrlExisting(badge.href),
        })),
        ...badges.map(async (badge) => ({
            badgeTitle: badge.title,
            url: badge.imageSrc,
            exists: await isUrlExisting(badge.imageSrc),
        })),
    ]);

    const imagesAndLinksCantBeLoaded = imagesAndLinksCanBeLoaded.filter(({ exists }) => !exists);
    if (imagesAndLinksCantBeLoaded.length > 0) {
        console.info({ imagesAndLinksCantBeLoaded });
        throw new Error(`Some referenced urls in badges can not be loaded.`);
    }

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