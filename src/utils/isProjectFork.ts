import { PROJECT_FLAGS } from '../config';
import fetch from 'node-fetch';

/**
 * Detects if the project is just a fork
 */
export async function isProjectFork(url: URL): Promise<boolean> {
    if (PROJECT_FLAGS[url.href] && PROJECT_FLAGS[url.href].isFork !== undefined) {
        return PROJECT_FLAGS[url.href].isFork;
    }
    const response = await fetch(url.href);
    const text = await response.text();
    const isFork = text.includes(`forked from`);
    return isFork;
}

/**
 * TODO: [🐩] When repository is not in cache and is private, it will not be detected as fork
 */
