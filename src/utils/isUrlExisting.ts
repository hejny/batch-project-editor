import fetch from 'node-fetch';

export async function isUrlExisting(url: string): Promise<boolean> {
    try {
        const response = await fetch(url);
        console.info('isUrlExisting', url, response.status);

        if (response.status >= 500) {
            // Note: When packagequality.com looks at the package for the first time, it returns a 504 status code
            return isUrlExisting(url);
        }

        return response.status < 400;
    } catch (error) {
        return false;
    }
}
