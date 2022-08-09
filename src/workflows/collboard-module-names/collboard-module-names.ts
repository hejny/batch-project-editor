import { IWorkflowOptions, WorkflowResult } from '../IWorkflow';

export async function collboardModuleNames({ commit }: IWorkflowOptions): Promise<WorkflowResult> {
    // TODO: Implement
    return commit('📦 Propper package names for Collboard');
}
