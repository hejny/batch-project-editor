import chalk from 'chalk';
import { githubOctokit } from '../../config';
import { uploadToRepository } from './uploadToRepository';

interface ICreateNewRepositoryOptions {
    organizationName: string;
    repositoryName: string;
}

export async function createNewRepository(options: ICreateNewRepositoryOptions) {
    const { organizationName, repositoryName } = options;

    /**/
    console.info(chalk.cyan(` ➕  Creating new repository ${repositoryName} `));
    const createResult = await githubOctokit.repos.createInOrg({
        org: organizationName,
        name: repositoryName,
        auto_init: true,
        private: false,
    });
    // console.log(createResult);
    console.info(chalk.green(` Repository ${repositoryName} created `));
    /**/

    /**/
    console.info(chalk.cyan(` ⬆  Uploading into repository ${repositoryName} `));
    /* const uploadResult = */ await uploadToRepository({
        organizationName,
        repositoryName,
        branch: 'main',
        files: [
            {
                path: 'index.html',
                content: `<h1>Welcome to ${repositoryName}!</h1>`,
            },
            {
                path: 'CNAME',
                content: `${repositoryName}.webgpt.cz`,
            },
            // TODO: !!! Add commit message
            // TODO: !!! Change default README.md
        ],
    });
    // console.log(uploadResult);
    console.info(chalk.green(`Uploaded into repository ${repositoryName}`));
    /**/

    /**/
    console.info(chalk.cyan(` 🌎  Publishing repository ${repositoryName} `));
    await githubOctokit.repos.createPagesSite({
        owner: organizationName,
        repo: repositoryName,
        source: {
            branch: 'main',
            path: '/',
        },
    });
    console.info(chalk.green(`Published on:\nhttps://${repositoryName}.webgpt.cz` /* <- TODO: Unhardcode */));
    /**/
}
