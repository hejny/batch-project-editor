import { IWorkflowOptions } from '../IWorkflow';

export async function normalizePackage({ commit }: IWorkflowOptions): Promise<void> {
    // TODO: Implement
    await commit('🗃️ Ordering package.json');
}
