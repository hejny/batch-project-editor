import { githubOctokit } from '../../config';

export async function setBranchToCommit(options: {
    organizationName: string;
    repositoryName: string;
    branch: string;
    commitSha: string;
}) {
    const { organizationName, repositoryName, branch, commitSha } = options;
    return await githubOctokit.git.updateRef({
        owner: organizationName,
        repo: repositoryName,
        ref: `heads/${branch}`,
        sha: commitSha,
    });
}
