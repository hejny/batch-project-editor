import { IWorkflowOptions, WorkflowResult } from '../IWorkflow';
import { normalizeTodosInSource } from './utils/normalizeTodosInSource';

export async function normalizeTodos({ modifyFiles, commit }: IWorkflowOptions): Promise<WorkflowResult> {
    await modifyFiles('**/*.{ts,tsx,js,jsx}', (filePath, fileContent) => normalizeTodosInSource(fileContent));
    return commit('🧽 Normalize TODOs');
}
