import chalk from 'chalk';

interface ICreateNewRepositoryOptions {
    repositoryName: string;
}

export async function createNewRepository({ repositoryName }: ICreateNewRepositoryOptions) {
    console.info(chalk.bgGreen(` ➕  Creating new repository ${repositoryName} `));

    // githubOctokit.repos.
}
/**
 * TODO: Simplyfy this file (maybe make some utils Class) and DRY runWorkflows + runAggregators
 * TODO: Maybe use nodegit
 */
