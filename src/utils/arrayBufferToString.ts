/**
 * Converts an ArrayBuffer to a string
 */
export function arrayBufferToString(data: ArrayBuffer): string {
    return String.fromCharCode.apply(null, new Uint16Array(data));
}
