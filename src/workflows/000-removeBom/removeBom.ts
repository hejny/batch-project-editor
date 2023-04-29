import { join } from 'path';
import { IWorkflowOptions, WorkflowResult } from '../IWorkflow';

export async function removeBom({
    projectPath,
    commit,
    readFile,
    modifyFiles,
}: IWorkflowOptions): Promise<WorkflowResult> {
    await modifyFiles(join(projectPath, '**/*'), (filePath, fileContents) => {
        if (fileContents.charCodeAt(0) === 0xfeff) {
            return fileContents.slice(1);
        } else {
            return fileContents;
        }
    });

    return commit('💥 Removing UTF-8 byte order marks (BOM)');
}
