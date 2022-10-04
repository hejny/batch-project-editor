export function removeDependencyPrefix(versionWithPrefix: string): string {
    const match = versionWithPrefix.match(
        /([0-9]+)\.([0-9]+)\.([0-9]+)(?:-([0-9A-Za-z-]+(?:\.[0-9A-Za-z-]+)*))?(?:\+[0-9A-Za-z-]+)?$/,
    );

    if (!match) {
        throw new Error(`String "${versionWithPrefix}" is not a valid semantic version`);
    }

    return match[0];
}
