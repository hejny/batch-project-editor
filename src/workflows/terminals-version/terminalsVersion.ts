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
            if (fileJson.terminals.some((existingTerminal) => existingTerminal.name === newTerminal.name)) {
                return;
            }

            if (fileJson.terminals.some((existingTerminal) => existingTerminal.command === newTerminal.command)) {
              return;
          }

            fileJson.terminals.push(newTerminal);
        }

        addTerminal({
            name: 'πΌπ Release major version',
            command: 'npm version major',
            onlySingle: true,
            focus: true,
        });
        addTerminal({
            name: 'πΌπ Release minor version',
            command: 'npm version minor',
            onlySingle: true,
            focus: true,
        });
        addTerminal({
            name: 'πΌπ©Ή Release patch version',
            command: 'npm version patch',
            onlySingle: true,
            focus: true,
        });

        return fileJson;
    });

    await commit('πΌ Add terminals for versioning');
}
