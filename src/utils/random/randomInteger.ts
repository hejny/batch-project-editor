/**
 *
 * Generates a random integer between a given range
 *
 * @param min Minimum number (inclusive)
 * @param max Maximum number (inclusive)
 *
 * @collboard-modules-sdk
 */
export function randomInteger(min: number, max: number): number {
    const random = Math.random();
    const range = max - min + 1;

    return Math.floor(random * range) + min;
}
