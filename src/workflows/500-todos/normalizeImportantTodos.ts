import { IWorkflowOptions, WorkflowResult } from '../IWorkflow';

export async function normalizeImportantTodos({ modifyFiles, commit }: IWorkflowOptions): Promise<WorkflowResult> {
    await modifyFiles('**/*.{ts,tsx,js,jsx}', (filePath, fileContent) =>
        fileContent.split('!!!').join('TODO: !!!').split('TODO: TODO:').join('TODO:'),
    );

    return commit('🧽 Normalize important TODOs');
}
