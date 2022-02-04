import { IWorkflowOptions } from '../IWorkflow';

export async function description({ commit }: IWorkflowOptions): Promise<void> {
    // TODO: Implement
    await commit('📝 Description of the project into package.json');
}
