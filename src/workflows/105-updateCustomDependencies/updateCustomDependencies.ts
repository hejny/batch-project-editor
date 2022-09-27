import spaceTrim from 'spacetrim';
import { fetchPackageVersion } from '../../utils/fetchPackageVersion';
import { IWorkflowOptions, WorkflowResult } from '../IWorkflow';

export async function updateCustomDependencies({
    packageJson,
    runCommand,
    commit,
    skippingBecauseOf,
}: IWorkflowOptions): Promise<WorkflowResult> {
    const dependencyName = 'spacetrim';
    // TODO: [0] for (const libraryName of ['spacetrim']) {

    // TODO: Also for devDependencies and work if dependencies not defined
    const dependencyUsedVersion = packageJson.dependencies![dependencyName];

    if (dependencyUsedVersion) {
        const dependencyCurrentVersion = await fetchPackageVersion(dependencyName);

        if (dependencyUsedVersion === dependencyCurrentVersion) {
            return /* [0] */ skippingBecauseOf(`Using ${dependencyName} in current version ${dependencyUsedVersion}`);
        }

        await runCommand(`npm install ${dependencyName}@${dependencyCurrentVersion}`);
        /* !!! Remove
        await modifyPackage((packageContent) => {
          packageContent.dependencies![dependencyName] =
          return packageContent;
        });
        */

        return await commit(
            /* [0] */
            spaceTrim(`
          🔼 Update library ${dependencyName} to ${dependencyCurrentVersion}

          ${dependencyName}@${dependencyUsedVersion} → ${dependencyName}@${dependencyCurrentVersion}
      `),
        );
    }

    return /* [0] */ skippingBecauseOf(`Not using ${dependencyName}`);
}
