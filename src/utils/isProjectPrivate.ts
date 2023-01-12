import { PROJECT_FLAGS } from '../config';
import fetch from 'node-fetch';

/**
 * Detects if the project is private on GitHub
 */
export async function isProjectPrivate(url: URL): Promise<boolean> {
    if (PROJECT_FLAGS[url.href] && PROJECT_FLAGS[url.href].isPrivate !== undefined) {
        return PROJECT_FLAGS[url.href].isPrivate;
    }

    return true;
}

/**
 * TODO: [🐩] When repository is not in cache and it does not exist, it will be falsly detected as private
 */
