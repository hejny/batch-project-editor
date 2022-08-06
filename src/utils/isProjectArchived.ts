/**
 * Detects if the project is archived on GitHub
 */
export async function isProjectArchived(url: URL): Promise<boolean> {
    const response = await fetch(url.href);
    const text = await response.text();
    const isArchived = text.includes(`This repository has been archived by the owner. It is now read-only.`);
    return isArchived;
}
