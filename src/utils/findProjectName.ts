import { execCommand } from './execCommand/execCommand';

export async function findProjectName(projectPath: string): Promise<{ org: string; name: string; url: URL }> {
    const projectUrlString = await execCommand({ cwd: projectPath, command: 'git config --get remote.origin.url' });
    const { org, name } = /^(https|git):\/\/github\.com\/(?<org>.*)\/(?<name>.*)(\.git)?$/.exec(projectUrlString)!
        .groups!;

    return { org, name, url: new URL(projectUrlString) };
}
