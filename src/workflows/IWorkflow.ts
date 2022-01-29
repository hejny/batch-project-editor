import { Promisable } from 'type-fest';

export interface IWorkflowOptions {
    projectPath: string;
    projectName: string;

    // TODO: !!! execCommand (with preset cwd)

    modifyFiles(globPattern: string, fileModifier: (fileContent: string) => Promisable<string>): Promise<void>;
    commit(message: string): Promise<void>;
}

export interface IWorkflow {
    (options: IWorkflowOptions): Promise<void>;
}
