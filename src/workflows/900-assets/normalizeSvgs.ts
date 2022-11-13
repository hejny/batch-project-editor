import { IWorkflowOptions, WorkflowResult } from '../IWorkflow';

export async function normalizeSvgs({
  skippingBecauseOf

}: IWorkflowOptions): Promise<WorkflowResult> {
  // Make script which goes through all SVGs and later through misc file types and normalize + brand them
  return skippingBecauseOf('Not implemented yet');
}
