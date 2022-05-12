import { PackageJson, Promisable } from 'type-fest';

export interface IWorkflowOptions {
    projectTitle: string;
    projectPath: string;
    projectUrl: URL;
    projectOrg: string;
    projectName: string;
    packageJson: PackageJson;
    branch: 'master' | 'main';

    runCommand(command: string): Promise<string>;
    readFile(filePath: string): Promise<string>;
    modifyFiles(globPattern: string, fileModifier: (fileContent: string) => Promisable<string>): Promise<void>;
    modifyJsonFiles<T>(globPattern: string, fileModifier: (fileJson: T) => Promisable<T>): Promise<void>;
    modifyPackage(fileModifier: (packageContent: PackageJson) => Promisable<PackageJson | void>): Promise<void>;
    commit(message: string): Promise<void>;
}

export interface IWorkflow {
    (options: IWorkflowOptions): Promise<void>;
}
