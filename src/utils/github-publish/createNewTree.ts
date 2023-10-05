import { githubOctokit } from '../../config';
import { IFileForGithub } from './interfaces/IFileForGithub';

export async function createNewTree(options: {
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
