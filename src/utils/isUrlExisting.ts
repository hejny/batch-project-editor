import fetch from 'node-fetch';

export async function isUrlExisting(url: string): Promise<boolean> {
    try {
        const response = await fetch(url);
        console.info('isUrlExisting', url, response.status);
        return response.status < 400;
    } catch (error) {
        return false;
    }
}
