import { PackageJson, Promisable } from 'type-fest';

export interface IAggregatorOptions {
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
}

export interface IAggregator<T> {
    initial: T;
    run(options: IAggregatorOptions): Promisable<T>;
    join(a: T, b: T): T;
    print(value: T): object | string | number | boolean;
    // TODO: !!! toHtml
}

/**
 * TODO: !!! Maybe allow to run just 1 aggregation in one commant and remove unnecessary things like initialize
 * TODO: !!! DRY with IWorkflow
 */
