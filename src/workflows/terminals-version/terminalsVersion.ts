import { IWorkflowOptions } from '../IWorkflow';

interface ITerminal {
    name: string;
    command: string;
    onlySingle: boolean;
    focus: boolean;
}

export async function terminalsVersion({ commit, modifyJsonFiles }: IWorkflowOptions): Promise<void> {
    await modifyJsonFiles<{ terminals: ITerminal[] }>('.vscode/terminals.json', (fileJson) => {
        function addTerminal(newTerminal: ITerminal) {
            const terminal = fileJson.terminals.find(
                (existingTerminal) => existingTerminal.command === newTerminal.command,
            );

            if (terminal) {
                Object.assign(terminal, newTerminal);
            } else {
                fileJson.terminals.push(newTerminal);
            }
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

    await commit('🔼 Add terminals for versioning');
}
