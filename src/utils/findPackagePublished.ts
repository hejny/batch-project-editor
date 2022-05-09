import { IWorkflowOptions } from '../workflows/IWorkflow';
import { isUrlExisting } from './isUrlExisting';

interface IPackagePublished {
    npm?: {
        scope?: string;
        name: string;
        url: URL;
    };
}

export async function findPackagePublished({
    projectOrg,
    projectName,
}: Pick<IWorkflowOptions, 'projectOrg' | 'projectName'>): Promise<IPackagePublished> {
    const published: IPackagePublished = {};

    if (await isUrlExisting(`https://registry.npmjs.org/package/@${projectOrg}/${projectName}`)) {
        published.npm = {
            scope: projectOrg,
            name: projectName,
            url: new URL(`https://www.npmjs.com/package/@${projectOrg}/${projectName}`),
        };
    }

    if (projectOrg !== 'collboard') {
        if (await isUrlExisting(`https://registry.npmjs.org/${projectName}`)) {
            published.npm = {
                name: projectName,
                url: new URL(`https://www.npmjs.com/package/${projectName}`),
            };
        }
    }

    return published;
}

/**
 * TODO: Test also GitHub repositories
 * TODO: Also find when the package is published under a different name
 */
