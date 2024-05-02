import { PackageJson } from 'type-fest';
import { IWorkflowOptions, WorkflowResult } from '../IWorkflow';

export async function funding({
    projectName,
    projectOrg,
    modifyPackage,
    commit,
}: IWorkflowOptions): Promise<WorkflowResult> {
    await modifyPackage((packageJson) => {
        const funding: Array<PackageJson['funding']> = [
            {
                type: 'individual',
                url: `https://buymeacoffee.com/hejny`,
            },
            {
                type: 'github',
                url: `https://github.com/${projectOrg}/${projectName}/blob/main/README.md#%EF%B8%8F-contributing`,
            },
        ];

        packageJson.funding = funding as any;

        return packageJson;
    });

    return commit('💸 Funding ');
}

/**
 * TODO: !! Copyleft
 */
