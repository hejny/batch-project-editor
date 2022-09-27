import compareVersions from 'compare-versions';

export async function fetchPackageVersion(packageName: string): Promise<string> {
    const url = `https://registry.npmjs.org/${packageName}`;
    const response = await fetch(url);
    const content = await response.json();

    const versions = Object.keys(content.versions);

    versions.sort(compareVersions).reverse();

    if (!versions[0]) {
        throw new Error(`No version for package ${packageName}`);
    }

    return versions[0];
}
