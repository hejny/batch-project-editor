import gitlog from 'gitlog';
import spaceTrim from 'spacetrim';
import { BATCH_PROJECT_EDITOR_COMMIT_SIGNATURE } from '../../config';
import { IWorkflowOptions, WorkflowResult } from '../IWorkflow';

export async function revertLastBpeCommit({
    projectPath,
    skippingBecauseOf,
    execCommandOnProject,
    commit,
}: IWorkflowOptions): Promise<WorkflowResult> {
    const [lastCommit] = await gitlog({
        repo: projectPath,
        number: 1,
        // author: "Dom Harrington",
        fields: ['hash', 'subject', 'body'],
    });

    if (!lastCommit.body.includes(BATCH_PROJECT_EDITOR_COMMIT_SIGNATURE)) {
        return skippingBecauseOf(`Last commit is not by Batch project editor`);
    }

    if (lastCommit.subject.includes('Revert') && lastCommit.body.includes('This reverts commit')) {
        return skippingBecauseOf(`Last commit is already a revert commit`);
    }

    await execCommandOnProject(`git revert ${lastCommit.hash} --no-edit --no-commit`);

    return commit(
        spaceTrim(`
            Revert "${lastCommit.subject}"

            This reverts commit ${lastCommit.hash}.
        `),
    );
}
