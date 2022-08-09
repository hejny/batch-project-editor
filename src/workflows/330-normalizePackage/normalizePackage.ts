import { IWorkflowOptions, WorkflowResult } from '../IWorkflow';

export async function normalizePackage({ commit }: IWorkflowOptions): Promise<WorkflowResult> {
    // TODO: Implement
    return commit('🗃️ Ordering package.json');
}
