import { IWorkflowOptions, WorkflowResult } from '../IWorkflow';

export async function authors({ commit }: IWorkflowOptions): Promise<WorkflowResult> {
    // TODO: Implement
    return commit('🤸⛹️ Authors in package.json');
}
