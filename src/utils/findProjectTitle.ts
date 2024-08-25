import { removeMarkdownFormatting } from '@promptbook/markdown-utils';
import { removeEmojis } from '@promptbook/utils';
import { readFile } from 'fs/promises';
import { basename, join } from 'path';
import { PackageJson } from 'type-fest';
import { isFileExisting } from './isFileExisting';

export async function findProjectTitle(projectPath: string): Promise<string> {
    if (await isFileExisting(join(projectPath, 'README.md'))) {
        const match = (await readFile(join(projectPath, 'README.md'), 'utf8')).match(/^#\s*(?<projectTitle>.*)\s*$/m);

        if (match && match.groups && match.groups.projectTitle) {
            let projectTitle = match.groups.projectTitle;
            projectTitle = removeEmojis(projectTitle);
            projectTitle = removeMarkdownFormatting(projectTitle);
            projectTitle = projectTitle
                .split(/\!\[.*\]\(.*\)/)
                .join('')
                .trim();
            return projectTitle;
        }
    }

    if (await isFileExisting(join(projectPath, 'package.json'))) {
        const projectName = (JSON.parse(await readFile(join(projectPath, 'package.json'), 'utf8')) as PackageJson).name;

        if (projectName) {
            return projectName;
        }
    }

    return basename(projectPath);
}
