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
    currentBranch: 'main' | string;

    execCommandOnProject(command: string): Promise<string>;
    readFile(filePath: string): Promise<string | null>;
    readJsonFile<T extends object>(filePath: string): Promise<T | null>;
    modifyFile(
        filePath: string,
        fileModifier: (fileContent: string | null) => Promisable<string | null>,
    ): Promise<void>;
    modifyFiles(
        globPattern: string,
        fileModifier: (filePath: string, fileContent: string) => Promisable<string | null>,
    ): Promise<void>;
    modifyJsonFile<T extends object>(
        filePath: string,
        fileModifier: (fileJson: T | null) => Promisable<T | null>,
    ): Promise<void>;
    modifyJsonFiles<T extends object>(
        globPattern: string,
        fileModifier: (filePath: string, fileJson: T) => Promisable<T | null>,
    ): Promise<void>;
    modifyPackage(fileModifier: (packageContent: PackageJson) => Promisable<PackageJson | void>): Promise<void>;
    commit(message: string): Promise<WorkflowResult.Change | WorkflowResult.NoChange>;
    madeSideEffect(whatWasDoneDescription: string): WorkflowResult.SideEffect;
    skippingBecauseOf(reasonToSkipDescription: string): WorkflowResult.Skip;
}

export interface IWorkflow {
    (options: IWorkflowOptions): Promisable<WorkflowResult>;
    initialize?(): Promisable<void>;
}

/**
 * TODO: !! Rename to IWorkflowUtils
 * TODO: [🥗] There should be 2 different returns: skippingBecauseOf VS notingChangedBecauseOf
 */
