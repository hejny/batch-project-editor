import chalk from 'chalk';
import { githubOctokit } from './config';

// TODO: !!! Refactor: Annotate
// TODO: !!! Enhance logging
// TODO: !!! Refactor: Split into files

interface ICreateNewRepositoryOptions {
    organizationName: string;
    repositoryName: string;
}

export async function createNewRepository(options: ICreateNewRepositoryOptions) {
    const { organizationName, repositoryName } = options;

    /**/
    console.info(chalk.bgGreen(` ➕  Creating new repository ${repositoryName} `));
    const createResult = await githubOctokit.repos.createInOrg({
        org: organizationName,
        name: repositoryName,
        auto_init: true,
        private: false,
    });
    console.log(createResult);
    /**/

    /**/
    console.info(chalk.bgGreen(` ⬆  Uploading into repository ${repositoryName} `));
    const uploadResult = await uploadToRepository({
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
    console.log(uploadResult);
    /**/

    /**/
    await githubOctokit.repos.createPagesSite({
        owner: organizationName,
        repo: repositoryName,
        source: {
            branch: 'main',
            path: '/',
        },
    });
    /**/
}

interface IFile {
    path: string;
    content: string;
}

interface IFileForGithub {
    path: string;
    content: {
        url: string;
        sha: string;
    };
}

async function uploadToRepository(options: {
    organizationName: string;
    repositoryName: string;
    branch: string;
    files: Array<IFile>;
}) {
    const { organizationName, repositoryName, branch, files } = options;

    // Note:  Gets commit's AND its tree's SHA
    const currentCommit = await getCurrentCommit({ organizationName, repositoryName, branch });

    const filesForGithub: Array<IFileForGithub> = await Promise.all(
        files.map(async ({ path, content }) => ({
            path,
            content: await createBlobForGithub({ organizationName, repositoryName, content }),
        })),
    );

    const newTree = await createNewTree({
        organizationName,
        repositoryName,
        files: filesForGithub,
        parentTreeSha: currentCommit.treeSha,
    });
    const commitMessage = `My commit message`; /* <- !!! Pass as param */
    const newCommit = await createNewCommit({
        organizationName,
        repositoryName,
        message: commitMessage,
        currentTreeSha: newTree.sha,
        currentCommitSha: currentCommit.commitSha,
    });
    await setBranchToCommit({ organizationName, repositoryName, branch, commitSha: newCommit.sha });
}

async function getCurrentCommit(options: { organizationName: string; repositoryName: string; branch: string }) {
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


async function createBlobForGithub(options: { organizationName: string; repositoryName: string; content: string }) {
    const { organizationName, repositoryName: repo, content } = options;
    const blobData = await githubOctokit.git.createBlob({
        owner: organizationName,
        repo,
        content,
        encoding: 'utf-8',
    });
    return blobData.data;
}


async function createNewTree(options: {
    organizationName: string;
    repositoryName: string;
    files: Array<IFileForGithub>;
    // blobs: any; //Octokit.GitCreateBlobResponse[];
    // paths: string[];
    parentTreeSha: string;
}) {
    const { organizationName: owner, repositoryName, files, parentTreeSha } = options;

    // Note: My custom config. Could be taken as parameters
    const tree = files.map(({ path, content: { sha } }) => ({
        path,
        mode: `100644`,
        type: `blob`,
        sha,
    }));
    const { data } = await githubOctokit.git.createTree({
        owner,
        repo: repositoryName,
        tree,
        base_tree: parentTreeSha,
    } as any);
    return data;
}

async function createNewCommit(options: {
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

async function setBranchToCommit(options: {
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
