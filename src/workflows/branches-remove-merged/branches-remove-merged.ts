import { IWorkflowOptions } from '../IWorkflow';

export async function branchesRemoveMerged({ runCommand }: IWorkflowOptions): Promise<void> {
    /*
    Note: This command makes no sence because the merged branchech will not be downloaded at the first place.
    TODO: Maybe also push the deletion to the remote?


    const branches = (await runCommand('git branch --merged')).split('\n');

    for (const branch of branches) {
        if (branch.startsWith('*')) {
            continue;
        }

        await runCommand(`git branch -D ${branch}`);
    }
    */
}
