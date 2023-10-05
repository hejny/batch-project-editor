import chalk from 'chalk';
// import { readFile } from 'fs-extra';
import { githubOctokit } from './config';

interface ICreateNewRepositoryOptions {
    repositoryName: string;
}

export async function createNewRepository({ repositoryName }: ICreateNewRepositoryOptions) {
    /**/
    console.info(chalk.bgGreen(` ➕  Creating new repository ${repositoryName} `));
    const createResult = await githubOctokit.repos.createInOrg({
        org: '1-2i',
        name: repositoryName,
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
}

interface IFileInGit {
    path: string;
    content: {
        url: string;
        sha: string;
    };
}

async function uploadToRepo(options: { org: string; repo: string; branch: string }) {
    const { org, repo, branch } = options;

    // Check if the repository already exists
    const isRepositoryInitialized = await checkRepositoryInitialized({ org, repo, branch });

    console.log({ isRepositoryInitialized });

    if (!isRepositoryInitialized) {
        console.info(chalk.bgGreen(` 🌟  Creating initial commit`));

        // If the repository doesn't exist, create an initial commit with an empty tree
        const emptyTreeSha = await createEmptyTree({ org, repo });
        const initialCommit = await createInitialCommit({ org, repo, treeSha: emptyTreeSha });

        await createBranch({ org, repo, branch, commitSha: initialCommit.sha });
    }

    // Continue with your code for adding files and creating commits
    const currentCommit = await getCurrentCommit({ org, repo, branch });
    const files: Array<IFileInGit> = [
        {
            path: 'CNAME',
            content: await createBlobForString({ org, repo, content: 'test.webgpt.cz' }),
        },
        // Add more files here
    ];
    const newTree = await createNewTree({
        owner: org,
        repo,
        files,
        parentTreeSha: currentCommit.treeSha,
    });
    const commitMessage = 'My commit message';
    const newCommit = await createNewCommit({
        org,
        repo,
        message: commitMessage,
        currentTreeSha: newTree.sha,
        currentCommitSha: currentCommit.commitSha,
    });
    await setBranchToCommit({ org, repo, branch, commitSha: newCommit.sha });
}

async function checkRepositoryInitialized(options: { org: string; repo: string; branch: string }) {
    const { org, repo, branch } = options;
    try {
        // Check if the default branch (usually "main" or "master") exists
        const { data: defaultBranchData } = await githubOctokit.repos.getBranch({
            owner: org,
            repo,
            branch,
        });
        return true;
    } catch (error) {
        if (error.status === 404) {
            return false;
        }
        throw error;
    }
}

async function checkRepositoryExists(options: { org: string; repo: string }) {
    const { org, repo } = options;
    try {
        await githubOctokit.repos.get({ owner: org, repo });
        return true;
    } catch (error) {
        if (error.status === 404) {
            return false;
        }
        throw error;
    }
}

async function createEmptyTree(options: { org: string; repo: string }) {
    const { org, repo } = options;

    // Create a dummy file to add to the initial tree
    const dummyFileContent = 'Initial commit';
    const dummyFileBlob = await createBlobForString({ org, repo, content: dummyFileContent });

    // Create a tree with the dummy file
    const tree = [
        {
            path: 'README.md', // You can use any file name you prefer
            mode: '100644',
            type: 'blob',
            sha: dummyFileBlob.sha,
        },
    ] as any;

    const { data } = await githubOctokit.git.createTree({
        owner: org,
        repo,
        tree,
    });

    return data.sha;
}

async function createInitialCommit(options: { org: string; repo: string; treeSha: string }) {
    const { org, repo, treeSha } = options;
    const intialCommit = await githubOctokit.git.createCommit({
        owner: org,
        repo,
        message: '🌟 Initial commit',
        tree: treeSha,
        parents: [],
    });
    return intialCommit.data;
}

async function createBranch(options: { org: string; repo: string; branch: string; commitSha: string }) {
    const { org, repo, branch, commitSha } = options;
    await githubOctokit.git.createRef({
        owner: org,
        repo,
        ref: `refs/heads/${branch}`,
        sha: commitSha,
    });
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
