import { IWorkflowOptions, WorkflowResult } from '../IWorkflow';

interface ITerminal {
    name: string;
    command?: string;
    commands?: string[];
    onlySingle: boolean;
    focus: boolean;
    execute?: boolean;
}

/*
<- TODO:
> type ITerminal = {
>     name: string;
>     onlySingle: boolean;
>     focus: boolean;
> } & ({ command: string } | { commands: string[] });
*/

export async function terminalsVersion({ commit, modifyJsonFile }: IWorkflowOptions): Promise<WorkflowResult> {
    await modifyJsonFile<{ terminals: ITerminal[] }>('.vscode/terminals.json', (fileJson) => {
        fileJson = fileJson || { terminals: [] };

        function addTerminal(newTerminal: ITerminal) {
            if (fileJson!.terminals.some((existingTerminal) => existingTerminal.name === newTerminal.name)) {
                return;
            }

            if (
                fileJson!.terminals.some(
                    (existingTerminal) =>
                        existingTerminal.command &&
                        newTerminal.command &&
                        existingTerminal.command === newTerminal.command,
                )
            ) {
                return;
            }

            if (
                fileJson!.terminals.some(
                    (existingTerminal) =>
                        existingTerminal.commands &&
                        newTerminal.commands &&
                        existingTerminal.commands.join(',') === newTerminal.commands.join(','),
                )
            ) {
                return;
            }

            fileJson!.terminals.push(newTerminal);
        }

        addTerminal({
            name: '🔼👑 Release major version',
            command: 'npm version major',
            onlySingle: true,
            focus: true,
        });
        addTerminal({
            name: '🔼🚀 Release minor version',
            command: 'npm version minor',
            onlySingle: true,
            focus: true,
        });
        addTerminal({
            name: '🔼🩹 Release patch version',
            command: 'npm version patch',
            onlySingle: true,
            focus: true,
        });

        addTerminal({
            name: '🔼👑🧪 Release pre-major version',
            commands: ['npm version premajor', 'npm version prerelease'],
            onlySingle: true,
            execute: false,
            focus: true,
        });
        addTerminal({
            name: '🔼🚀🧪 Release pre-minor version',
            commands: ['npm version preminor', 'npm version prerelease'],
            onlySingle: true,
            execute: false,
            focus: true,
        });

        return fileJson;
    });

    return commit('🔼 Add terminals for versioning');
}
