import { PackageJson, Promisable } from 'type-fest';

// !!! Anotate Skip vs NoChange
// !!! Anotate Change vs SideEffect
// !!! Anotate why there is no Error

export enum WorkflowResult {
    Skip = 'SKIP',
    Change = 'CHANGE',
    SideEffect = 'SIDE_EFFECT',
    NoChange = 'NO_CHANGE',
    Error = 'ERROR',
}

export interface IWorkflowOptions {
    projectTitle: string;
    projectPath: string;
    projectUrl: URL;
    projectOrg: string;
    projectName: string;
    packageJson: PackageJson;
    mainBranch: 'master' | 'main';

    runCommand(command: string): Promise<string>;
    readFile(filePath: string): Promise<string>;
    modifyFiles(globPattern: string, fileModifier: (fileContent: string) => Promisable<string>): Promise<void>;
    modifyJsonFiles<T>(globPattern: string, fileModifier: (fileJson: T) => Promisable<T>): Promise<void>;
    modifyPackage(fileModifier: (packageContent: PackageJson) => Promisable<PackageJson | void>): Promise<void>;
    commit(message: string): Promise<WorkflowResult.Change | WorkflowResult.NoChange>;
    skippingBecauseOf(message: string): WorkflowResult.Skip;
}

export interface IWorkflow {
    (options: IWorkflowOptions): Promisable<WorkflowResult>;
}
