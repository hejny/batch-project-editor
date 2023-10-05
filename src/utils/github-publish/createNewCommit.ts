import { githubOctokit } from '../../config';

export async function createNewCommit(options: {
    organizationName: string;
    repositoryName: string;
    message: string;
    currentTreeSha: string;
    currentCommitSha: string;
}) {
    const { organizationName, repositoryName, message, currentTreeSha, currentCommitSha } = options;

    return await (
        await githubOctokit.git.createCommit({
            owner: organizationName,
            repo: repositoryName,
            message,
            tree: currentTreeSha,
            parents: [currentCommitSha],
        })
    ).data;
}
