import { PackageJson, Promisable } from 'type-fest';

export enum WorkflowResult {
    /**
     * Workflow is skipping the project because of some internal reason
     */
    Skip = 'SKIP',

    /**
     * There made and commited some changes
     */
    Change = 'CHANGE',

    /**
     * Workflow made some changes but not via commit
     * TODO: Make also a description of the side-effect similarly as Skip
     */
    SideEffect = 'SIDE_EFFECT',

    /**
     * There was no change on the project during the workflow
     */
    NoChange = 'NO_CHANGE',

    /**
     * Workflow ended unsuccessfully
     */
    Error = 'ERROR',
}

export interface IWorkflowOptions {
    projectTitle: string;
    projectPath: string;
    projectUrl: URL;
    projectOrg: string;
    projectName: string;
    packageJson: PackageJson;
    readmeContent: string;
    mainBranch: 'master' | 'main';

    execCommandOnProject(command: string): Promise<string>;
    readFile(filePath: string): Promise<string>;
    modifyFile(filePath: string, fileModifier: (fileContent: string | null) => Promisable<string>): Promise<void>;
    modifyFiles(globPattern: string, fileModifier: (fileContent: string) => Promisable<string>): Promise<void>;
    modifyJsonFiles<T>(globPattern: string, fileModifier: (fileJson: T) => Promisable<T>): Promise<void>;
    modifyPackage(fileModifier: (packageContent: PackageJson) => Promisable<PackageJson | void>): Promise<void>;
    commit(message: string): Promise<WorkflowResult.Change | WorkflowResult.NoChange>;
    skippingBecauseOf(message: string): WorkflowResult.Skip;
}

export interface IWorkflow {
    (options: IWorkflowOptions): Promisable<WorkflowResult>;
    initialize?(): Promisable<void>;
}
