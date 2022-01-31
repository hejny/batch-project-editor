import { IWorkflowOptions } from '../IWorkflow';

export async function badges({
    modifyPackage,
    runCommand,
    commit,
}: IWorkflowOptions): Promise<void> {
    await runCommand('npm install');
    await runCommand('npm audit fix');

    // Removing prefixes before versioning - we just want "10.4.0" not "^10.4.0" @see https://youtu.be/ctkGh7RpgQ8
    await modifyPackage((packageContent) => {
        for (const type of ['devDependencies', 'dependencies']) {
            for (const dependency in packageContent[type]) {
                const match =
                    /([0-9]+)\.([0-9]+)\.([0-9]+)(?:-([0-9A-Za-z-]+(?:\.[0-9A-Za-z-]+)*))?(?:\+[0-9A-Za-z-]+)?$/.exec(
                        packageContent[type][dependency],
                    );
                packageContent[type][dependency] = match[0];
            }
        }
        return packageContent;
    });

    await commit('🔺 Audit dependencies');
}
