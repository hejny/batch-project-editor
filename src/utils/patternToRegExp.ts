import escapeRegExp from 'lodash/escapeRegExp';

/**
 * Converts a string pattern with "*" to a regular expression
 * It can take multiple patterns and will return a union of all patterns in the form of a regular expression
 *
 * @param pattern The pattern to convert to a regular expression; for example "image/*"
 * @returns RegExp; for example /^image\/.*$/
 *
 * @collboard-modules-sdk
 */
export function patternToRegExp(...patterns: Array<string>): RegExp {
    if (patterns.length === 1) {
        return new RegExp('^' + escapeRegExp(patterns[0]).split('\\*').join('.*') + '$');
    } else {
        return new RegExp(`^(${patterns.map((pattern) => escapeRegExp(pattern).split('\\*').join('.*')).join('|')})$`);
    }
}
