import gitlog from 'gitlog';
import spaceTrim from 'spacetrim';
import { BATCH_PROJECT_EDITOR_COMMIT_SIGNATURE } from '../../config';
import { IWorkflowOptions, WorkflowResult } from '../IWorkflow';

export async function onceRevertLastBpeCommit({
    projectPath,
    skippingBecauseOf,
    execCommandOnProject,
    commit,
}: IWorkflowOptions): Promise<WorkflowResult> {
    const recentCommits = await gitlog({
        repo: projectPath,
        number: 1 /* <- TODO: !! [0] Configurable - how far should I search */,
        // author: "Dom Harrington",
        fields: ['hash', 'subject', 'body'],
    });

    for (const recentCommit of recentCommits) {
        if (!recentCommit.body.includes(BATCH_PROJECT_EDITOR_COMMIT_SIGNATURE)) {
            continue;
            // return skippingBecauseOf(`Last commit is not by Batch project editor`);up
        }

        /**/
        // Note: Extra condition
        if (!recentCommit.subject.includes('Normalize TODOs')) {
            continue;
        }
        /**/

        if (recentCommit.subject.includes('Revert') && recentCommit.body.includes('This reverts commit')) {
            continue;
            // return skippingBecauseOf(`Last commit is already a revert commit`);
        }

        await execCommandOnProject(`git revert ${recentCommit.hash} --no-edit --no-commit`);

        return commit(
            spaceTrim(`
            Revert "${recentCommit.subject}"

            This reverts commit ${recentCommit.hash}.
        `),
        );
        // TODO: !! [0] Allow to make multiple reverts
    }

    return skippingBecauseOf(`No recent commit for revent.`);
}

/**
 * TODO: Make some better system for workflows not connected with project
 */
