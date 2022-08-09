import { IWorkflowOptions, WorkflowResult } from '../IWorkflow';
import { searchMidjourney } from './utils/searchMidjourney/searchMidjourney';

export async function aiGeneratedWallpaperHarvest({
    packageJson,
    skippingBecauseOf,
}: IWorkflowOptions): Promise<WorkflowResult> {
    // TODO: !!! Implement

    searchMidjourney({ prompt: '!!!!!!!!!!!!!!!!!!' });
    return skippingBecauseOf(`Not implemented yet`);
}
