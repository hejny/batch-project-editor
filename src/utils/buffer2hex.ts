/**
 * Converts an ArrayBuffer to an hex string
 *
 * @param buffer ArrayBuffer
 * @returns string in hexadecimal representation
 */
export function buffer2hex(buffer: ArrayBuffer): string {
    // buffer is an ArrayBuffer
    return [...new Uint8Array(buffer)].map((x) => x.toString(16).padStart(2, '0')).join('');
}
