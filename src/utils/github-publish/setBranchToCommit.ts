import { githubOctokit } from '../../config';

/**
 * Set branch head to given commit during publishing
 *
 * @private within github-publish folder
 */
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
