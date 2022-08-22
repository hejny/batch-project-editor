import escapeRegExp from 'lodash/escapeRegExp';

/**
 * Converts a string pattern with "%" to a regular expression
 * It can take multiple patterns and will return a union of all patterns in the form of a regular expression
 * Note: [🥀] Using % not * as a wildcard char because of strange behavior of (probably) commander.js
 *
 * @param pattern The pattern to convert to a regular expression; for example "image/%"
 * @returns RegExp; for example /^image\/.*$/
 *
 * @collboard-modules-sdk
 */
export function patternToRegExp(...patterns: Array<string>): RegExp {
    const positivePatterns = patterns.filter((pattern) => !pattern.startsWith('-'));
    const negativePatterns = patterns
        .filter((pattern) => pattern.startsWith('-'))
        .map((pattern) => pattern.substring(1));

    if (positivePatterns.length === 1 && negativePatterns.length === 0) {
        return new RegExp('^' + escapeRegExp(patterns[0]).split('%').join('.*') + '$');
    }

    let positivePatternsRegex = positivePatterns
        .map((pattern) => escapeRegExp(pattern).split('%').join('.*'))
        .join('|');
    let negativePatternsRegex = negativePatterns
        .map((pattern) => escapeRegExp(pattern).split('%').join('.*'))
        .join('|');

    positivePatternsRegex = positivePatterns.length === 0 ? `` : `(${positivePatternsRegex})`;
    negativePatternsRegex = negativePatterns.length === 0 ? `` : `(?<!(${negativePatternsRegex}))`;

    return new RegExp(`^${positivePatternsRegex}${negativePatternsRegex}$`);
}
