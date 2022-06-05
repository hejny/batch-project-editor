/**
 * Pick random item from the recieved array
 *
 * @collboard-modules-sdk
 */
export function randomItem<T>(...items: T[]): T {
    return items[Math.floor(Math.random() * items.length)];
}
