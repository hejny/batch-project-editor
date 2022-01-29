import { readFile, writeFile } from 'fs/promises';
import glob from 'glob-promise';
import { basename, join } from 'path';
import { Promisable } from 'type-fest';
import { WORKFLOWS } from './config';
import { findAllProjects } from './utils/findAllProjects';
import { findProjectName } from './utils/findProjectName';

main();

async function main() {
    for (const projectPath of await findAllProjects()) {
        for (const workflow of WORKFLOWS) {
            const projectName = await findProjectName(projectPath);
            console.info(`🔼 Running workflow ${workflow.name} for project ${projectName}`);

            // TODO: !!! Require updated main/master branch
            // TODO: !!! Pull

            await workflow({
                projectPath,
                projectName: basename(projectPath),

                async modifyFiles(
                    globPattern: string,
                    fileModifier: (fileContent: string) => Promisable<string>,
                ): Promise<void> {
                    for (const filePath of await glob(join(projectPath, globPattern))) {
                        const fileContent = await readFile(filePath, 'utf8');
                        const newFileContent = await fileModifier(fileContent);

                        if (fileContent !== newFileContent) {
                            console.info(`💾 Changing file ${filePath}`);
                            await writeFile(filePath, newFileContent);
                        } else {
                            // console.info(`⬜ Keeping file ${filePath}`);
                        }
                    }
                },
                async commit(message: string): Promise<void> {},
            });
        }
    }
}
