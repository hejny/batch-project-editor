import fetch from 'node-fetch';

export async function isUrlExisting(url: string): Promise<boolean> {
    try {
        const response = await fetch(url);
        console.log(response.status);
        return response.status < 300 /* Note: Redirects are sign of private packages */;
    } catch (error) {
        return false;
    }
}
