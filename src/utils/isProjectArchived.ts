import fetch from 'node-fetch';
import { PROJECT_FLAGS } from '../config';

/**
 * Detects if the project is archived on GitHub
 */
export async function isProjectArchived(url: URL): Promise<boolean> {
    if (PROJECT_FLAGS[url.href] && PROJECT_FLAGS[url.href].isArchived !== undefined) {
        return PROJECT_FLAGS[url.href].isArchived;
    }

    const response = await fetch(url.href);
    const text = await response.text();
    const isArchived = text.includes(`This repository has been archived by the owner`);

    return isArchived;
}

/**
 * TODO: [🐩] When repository is not in cache and is private, it will not be detected as archived
 */
