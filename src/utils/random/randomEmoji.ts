import { EMOJIS } from './emojis';
import { randomItem } from './randomItem';

/**
 *
 * Pick random emoji char like "🍆", "🍡", "🍤"...
 *
 * @collboard-modules-sdk
 */
export function randomEmoji(): string {
    return randomItem(...EMOJIS);
}

/**
 * TODO: Constrain by group of emojis like animals, plants,...
 * TODO: To separate emoji library
 * TODO: Use in emoji modules
 */
