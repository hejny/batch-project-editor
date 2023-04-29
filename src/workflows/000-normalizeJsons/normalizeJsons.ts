import { IWorkflowOptions, WorkflowResult } from '../IWorkflow';

export async function normalizeJsons({
    projectPath,
    commit,
    readFile,
    modifyJsonFiles,
}: IWorkflowOptions): Promise<WorkflowResult> {
    await modifyJsonFiles('**/*.json', (filePath, fileContents) => {
        return fileContents;
    });

    return commit('🗃️ Normalize JSONs');
}
