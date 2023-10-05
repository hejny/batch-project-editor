import chalk from 'chalk';
// import { readFile } from 'fs-extra';
import { githubOctokit } from './config';

// TODO: !!! Refactor: Turn on github pages
// TODO: !!! Refactor: Split into files
// TODO: !!! Refactor: Rename functions
// TODO: !!! Refactor: Rename options
// TODO: !!! Refactor: Annotate
// TODO: !!! Refactor: Cleanup

interface ICreateNewRepositoryOptions {
    repositoryName: string;
}

export async function createNewRepository({ repositoryName }: ICreateNewRepositoryOptions) {
    /*/
    console.info(chalk.bgGreen(` ➕  Creating new repository ${repositoryName} `));
    const createResult = await githubOctokit.repos.createInOrg({
        org: '1-2i',
        name: repositoryName,
        auto_init: true,
        private: false,
    });
    console.log(createResult);
    /**/

    /**/
    console.info(chalk.bgGreen(` ⬆  Uploading into repository ${repositoryName} `));
    const uploadResult = await uploadToRepo({
        org: '1-2i',
        repo: repositoryName /* <- TODO: !!! Unite names */,
        branch: 'main',
    });
    console.log(uploadResult);
    /**/

    /**/
    await githubOctokit.repos.createPagesSite({
        owner: '1-2i',
        repo: repositoryName,
        source: {
            branch: 'main',
            path: '/',
        },
    });
    /**/
}

interface IFileInGit {
    path: string;
    content: {
        url: string;
        sha: string;
    };
}

async function uploadToRepo(options: { org: string; repo: string; branch: string }) {
    // <- TODO: !!! Rename to uploadToRepository + other function
    const { org, repo, branch } = options;

    // gets commit's AND its tree's SHA
    const currentCommit = await getCurrentCommit({ org, repo, branch });

    /*
    const filesPaths = await glob(coursePath);
    const filesBlobs = await Promise.all(filesPaths.map(createBlobForFile({ org, repo })));
    const pathsForBlobs = filesPaths.map((fullPath) => path.relative(coursePath, fullPath));
    */

    const files: Array<IFileInGit> = [
        {
            path: 'CNAME' /* <- !!! Pass as param */,
            content: await createBlobForString({ org, repo, content: 'test.webgpt.cz' /* <- !!! Pass as param */ }),
        },
    ];

    const newTree = await createNewTree({
        owner: org,
        repo,
        files,
        parentTreeSha: currentCommit.treeSha,
    });
    const commitMessage = `My commit message`; /* <- !!! Pass as param */
    const newCommit = await createNewCommit({
        org,
        repo,
        message: commitMessage,
        currentTreeSha: newTree.sha,
        currentCommitSha: currentCommit.commitSha,
    });
    await setBranchToCommit({ org, repo, branch, commitSha: newCommit.sha });
}

async function getCurrentCommit(options: { org: string; repo: string; branch: string }) {
    const { org, repo, branch } = options;

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
}

/*
// Notice that readFile's utf8 is typed differently from Github's utf-8
const getFileAsUTF8 = (filePath: string) => readFile(filePath, 'utf8');
*/

async function createBlobForString(options: { org: string; repo: string; content: string }) {
    const { org, repo, content } = options;
    const blobData = await githubOctokit.git.createBlob({
        owner: org,
        repo,
        content,
        encoding: 'utf-8',
    });
    return blobData.data;
}

async function createBlobForFile(options: { org: string; repo: string }) {
    const { org, repo } = options;

    return async (filePath: string) => {
        const content = `!!!${filePath}`;
        //const content = await getFileAsUTF8(filePath);
        const blobData = await githubOctokit.git.createBlob({
            owner: org,
            repo,
            content,
            encoding: 'utf-8',
        });
        return blobData.data;
    };
}

async function createNewTree(options: {
    owner: string;
    repo: string;
    files: Array<IFileInGit>;
    // blobs: any; //Octokit.GitCreateBlobResponse[];
    // paths: string[];
    parentTreeSha: string;
}) {
    const { owner, repo, files, parentTreeSha } = options;

    // My custom config. Could be taken as parameters
    const tree = files.map(({ path, content: { sha } }) => ({
        path,
        mode: `100644`,
        type: `blob`,
        sha,
    }));
    const { data } = await githubOctokit.git.createTree({
        owner,
        repo,
        tree,
        base_tree: parentTreeSha,
    } as any);
    return data;
}

async function createNewCommit(options: {
    org: string;
    repo: string;
    message: string;
    currentTreeSha: string;
    currentCommitSha: string;
}) {
    const { org, repo, message, currentTreeSha, currentCommitSha } = options;

    return await (
        await githubOctokit.git.createCommit({
            owner: org,
            repo,
            message,
            tree: currentTreeSha,
            parents: [currentCommitSha],
        })
    ).data;
}

async function setBranchToCommit(options: { org: string; repo: string; branch: string; commitSha: string }) {
    const { org, repo, branch, commitSha } = options;
    return await githubOctokit.git.updateRef({
        owner: org,
        repo,
        ref: `heads/${branch}`,
        sha: commitSha,
    });
}
