import Octokit from '@octokit/rest';
import chalk from 'chalk';
import { readFile } from 'fs-extra';
import glob from 'globby';
import path from 'path';
import { githubOctokit } from './config';

interface ICreateNewRepositoryOptions {
    repositoryName: string;
}

export async function createNewRepository({ repositoryName }: ICreateNewRepositoryOptions) {
    console.info(chalk.bgGreen(` ➕  Creating new repository ${repositoryName} `));

    const createResult = await githubOctokit.repos.createInOrg({
        org: '1-2i',
        name: repositoryName,
        private: false,
    });

    await uploadToRepo({
        org: '1-2i',
        name: repositoryName,
        branch: 'main',
    });

    console.log(createResult);
}

async function uploadToRepo(options: { coursePath: string; org: string; repo: string; branch: string }) {
    const { coursePath, org, repo, branch } = options;

    // gets commit's AND its tree's SHA
    const currentCommit = await getCurrentCommit(githubOctokit, org, repo, branch);
    const filesPaths = await glob(coursePath);
    const filesBlobs = await Promise.all(filesPaths.map(createBlobForFile(githubOctokit, org, repo)));
    const pathsForBlobs = filesPaths.map((fullPath) => path.relative(coursePath, fullPath));
    const newTree = await createNewTree(githubOctokit, org, repo, filesBlobs, pathsForBlobs, currentCommit.treeSha);
    const commitMessage = `My commit message`;
    const newCommit = await createNewCommit(
        githubOctokit,
        org,
        repo,
        commitMessage,
        newTree.sha,
        currentCommit.commitSha,
    );
    await setBranchToCommit(githubOctokit, org, repo, branch, newCommit.sha);
}

const getCurrentCommit = async (githubOctokit: Octokit, org: string, repo: string, branch: string = 'master') => {
    const { data: refData } = await githubOctokit.git.getRef({
        owner: org,
        repo,
        ref: `heads/${branch}`,
    });
    const commitSha = refData.object.sha;
    const { data: commitData } = await githubOctokit.git.getCommit({
        owner: org,
        repo,
        commit_sha: commitSha,
    });
    return {
        commitSha,
        treeSha: commitData.tree.sha,
    };
};

// Notice that readFile's utf8 is typed differently from Github's utf-8
const getFileAsUTF8 = (filePath: string) => readFile(filePath, 'utf8');

const createBlobForFile = (githubOctokit: Octokit, org: string, repo: string) => async (filePath: string) => {
    const content = await getFileAsUTF8(filePath);
    const blobData = await githubOctokit.git.createBlob({
        owner: org,
        repo,
        content,
        encoding: 'utf-8',
    });
    return blobData.data;
};

const createNewTree = async (
    githubOctokit: Octokit,
    owner: string,
    repo: string,
    blobs: Octokit.GitCreateBlobResponse[],
    paths: string[],
    parentTreeSha: string,
) => {
    // My custom config. Could be taken as parameters
    const tree = blobs.map(({ sha }, index) => ({
        path: paths[index],
        mode: `100644`,
        type: `blob`,
        sha,
    })) as Octokit.GitCreateTreeParamsTree[];
    const { data } = await githubOctokit.git.createTree({
        owner,
        repo,
        tree,
        base_tree: parentTreeSha,
    });
    return data;
};

const createNewCommit = async (
    githubOctokit: Octokit,
    org: string,
    repo: string,
    message: string,
    currentTreeSha: string,
    currentCommitSha: string,
) =>
    (
        await githubOctokit.git.createCommit({
            owner: org,
            repo,
            message,
            tree: currentTreeSha,
            parents: [currentCommitSha],
        })
    ).data;

const setBranchToCommit = (
    githubOctokit: Octokit,
    org: string,
    repo: string,
    branch: string = `master`,
    commitSha: string,
) =>
    githubOctokit.git.updateRef({
        owner: org,
        repo,
        ref: `heads/${branch}`,
        sha: commitSha,
    });
