import fetch from 'node-fetch';
import { forTime } from 'waitasecond';

/**
 * Check if the given URL is a valid and contains some content
 *
 * @param url {string}
 * @returns {boolean}
 */
export async function isUrlExisting(url: string, _recursion = 0): Promise<boolean> {
    if (_recursion >= 10) {
        return false;
    }
    try {
        const response = await fetch(url);
        console.info('isUrlExisting', url, response.status);

        if (response.status >= 500) {
            // Note: When packagequality.com looks at the package for the first time, it returns a 504 status code
            await forTime(1000);
            return isUrlExisting(url, _recursion + 1);
        }

        return response.status < 400;
    } catch (error) {
        return false;
    }
}
