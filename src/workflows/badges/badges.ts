import spaceTrim from 'spacetrim';
import { IWorkflowOptions } from '../IWorkflow';

const BADGES = /<!--Badges-->(?<badges>.*)<!--\/Badges-->/is;

export async function badges({ runCommand, modifyFiles, commit }: IWorkflowOptions): Promise<void> {
    const remoteOriginUrl = await runCommand('git config --get remote.origin.url');
    const { scope, name } = /^(https|git):\/\/github\.com\/(?<scope>.*)\/(?<name>.*)(\.git)$/.exec(remoteOriginUrl)!.groups!;

    const badges: Array<{
        title: string;
        imageSrc: string;
        href: string;
    }> = [];

    // TODO: !!! For each project only relevant badges should be added

    badges.push({
        // TODO: !!! Use here some npm name not name
        // TODO: !!! Only for not scoped packages on NPM
        title: 'Package Quality',
        imageSrc: `https://packagequality.com/shield/${name}.svg`,
        href: `https://packagequality.com/#?package=${name}`,
    });

    badges.push({
        title: 'License',
        imageSrc: `https://img.shields.io/github/license/${scope}/${name}.svg?style=flat`,
        href: `https://raw.githubusercontent.com/${scope}/${name}/master/LICENSE`,
    });

    badges.push({
        title: `NPM Version`,
        imageSrc: `https://badge.fury.io/js/@${scope}%2F${name}.svg`,
        href: `https://www.npmjs.com/package/@${scope}/${name}`,
    });

    badges.push({
        title: `Test`,
        imageSrc: `https://github.com/${scope}/${name}/actions/workflows/test.yml/badge.svg`,
        href: `https://github.com/${scope}/${name}/actions/workflows/test.yml`,
    });

    badges.push({
        title: `Lint`,
        imageSrc: `https://github.com/${scope}/${name}/actions/workflows/lint.yml/badge.svg`,
        href: `https://github.com/${scope}/${name}/actions/workflows/lint.yml`,
    });

    badges.push({
        title: `Known Vulnerabilities`,
        imageSrc: `https://snyk.io/test/github/${scope}/${name}/badge.svg`,
        href: `https://snyk.io/test/github/${scope}/${name}`,
    });

    badges.push({
        title: `Issues`,
        imageSrc: `https://img.shields.io/github/issues/${scope}/${name}.svg?style=flat`,
        href: `https://github.com/${scope}/${name}/issues`,
    });

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
