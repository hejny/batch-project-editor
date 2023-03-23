import { IWorkflowOptions, WorkflowResult } from '../IWorkflow';

interface ITerminal {
    name: string;
    command: string;
    onlySingle: boolean;
    focus: boolean;
}

export async function terminalsVersion({ commit, modifyJsonFile }: IWorkflowOptions): Promise<WorkflowResult> {
    await modifyJsonFile<{ terminals: ITerminal[] }>('.vscode/terminals.json', (fileJson) => {
        fileJson = fileJson || { terminals: [] };

        function addTerminal(newTerminal: ITerminal) {
            if (fileJson!.terminals.some((existingTerminal) => existingTerminal.name === newTerminal.name)) {
                return;
            }

            if (fileJson!.terminals.some((existingTerminal) => existingTerminal.command === newTerminal.command)) {
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

        return fileJson;
    });

    return commit('🔼 Add terminals for versioning');
}
