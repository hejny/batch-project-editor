import { PackageJson, Promisable } from 'type-fest';

export interface IAggregatorOptions {
    projectTitle: string;
    projectPath: string;
    projectUrl: URL;
    projectOrg: string;
    projectName: string;
    packageJson: PackageJson;
    readmeContent: string;
    mainBranch: 'main' | string;

    execCommandOnProject(command: string): Promise<string>;
    readFile(filePath: string): Promise<string>;
}

export interface IAggregator<T> {
    initial: T;
    run(options: IAggregatorOptions): Promisable<T>;
    join(a: T, b: T): T;
    print(value: T): object | string | number | boolean;
}

/**
 *  TODO: Split into mainBranch to mainBranch and currentBranch
 * TODO: [👊] Add utility checkoutMainBranch
 * TODO: DRY with IWorkflow
 * TODO: Make toHtml instead of print
 */
