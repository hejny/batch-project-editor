import { PackageJson, Promisable } from 'type-fest';

export interface IWorkflowOptions {
    projectTitle: string;
    projectPath: string;
    projectUrl: URL;
    projectOrg: string;
    projectName: string;
    packageJson: PackageJson;

    runCommand(command: string): Promise<string>;
    modifyFiles(globPattern: string, fileModifier: (fileContent: string) => Promisable<string>): Promise<void>;
    modifyPackage(fileModifier: (packageContent: PackageJson) => Promisable<PackageJson>): Promise<void>;
    commit(message: string): Promise<void>;
}

export interface IWorkflow {
    (options: IWorkflowOptions): Promise<void>;
}
