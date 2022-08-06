/**
 * Detects if the project is just a fork
 */
export async function isProjectFork(url: URL): Promise<boolean> {
    const response = await fetch(url.href);
    const text = await response.text();
    const isFork = text.includes(`forked from`);
    return isFork;
}
