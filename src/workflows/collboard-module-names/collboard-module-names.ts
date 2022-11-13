import { IWorkflowOptions, WorkflowResult } from '../IWorkflow';

export async function collboardModuleNames({ skippingBecauseOf }: IWorkflowOptions): Promise<WorkflowResult> {
    return skippingBecauseOf('Not implemented yet');
    // return commit('📦 Propper package names for Collboard');
}
