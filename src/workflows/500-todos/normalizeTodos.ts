import { IWorkflowOptions, WorkflowResult } from '../IWorkflow';

export async function normalizeTodos({ modifyFiles, commit }: IWorkflowOptions): Promise<WorkflowResult> {
    await modifyFiles('**/*.{ts,tsx,js,jsx}', (filePath, fileContent) => {
        for (let i = 20; i !== 1; i--) {
            const tag = '!'.repeat(i);
            fileContent = fileContent.split(tag).join(`TODO: ${tag}`);
        }

        for (let i = 0; i < 20; i++) {
            fileContent = fileContent.split('TODO:').join('TODO:');
        }

        /*
        TODO: Be aware about indentation
        fileContent = fileContent.split('TODO:').join(' TODO: ');
        for (let i = 0; i < 3; i++) {
            fileContent = fileContent.split('  TODO:').join(' TODO:');
            fileContent = fileContent.split('TODO:  ').join(' TODO: ');
        }
        */

        return fileContent;
    });

    return commit('🧽 Normalize TODOs');
}


/**
 * TODO: NEVER chage code ONLY change comments
 * TODO: No more than one TODO on line> "TODO: [🧠] TODO: !!x return type Promisable<void>"
 */