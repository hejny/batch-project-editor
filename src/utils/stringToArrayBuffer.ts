/**
 * Converts a string to ArrayBuffer
 */

export function stringToArrayBuffer(data: string): ArrayBuffer {
    var buf = new ArrayBuffer(data.length * 2); // 2 bytes for each char
    var bufView = new Uint16Array(buf);
    for (var i = 0, strLen = data.length; i < strLen; i++) {
        bufView[i] = data.charCodeAt(i);
    }
    return buf;
}
