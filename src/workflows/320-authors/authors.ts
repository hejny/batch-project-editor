import { IWorkflowOptions } from '../IWorkflow';

export async function authors({ commit }: IWorkflowOptions): Promise<void> {
    // TODO: Implement
    await commit('🤸⛹️ Authors in package.json');
}
