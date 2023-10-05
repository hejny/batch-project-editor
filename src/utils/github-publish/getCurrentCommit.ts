import { githubOctokit } from '../../config';

export async function getCurrentCommit(options: { organizationName: string; repositoryName: string; branch: string }) {
    const { organizationName, repositoryName, branch } = options;

    const { data: refData } = await githubOctokit.git.getRef({
        owner: organizationName,
        repo: repositoryName,
        ref: `heads/${branch}`,
    });
    const commitSha = refData.object.sha;
    const { data: commitData } = await githubOctokit.git.getCommit({
        owner: organizationName,
        repo: repositoryName,
        commit_sha: commitSha,
    });
    return {
        commitSha,
        treeSha: commitData.tree.sha,
    };
}
