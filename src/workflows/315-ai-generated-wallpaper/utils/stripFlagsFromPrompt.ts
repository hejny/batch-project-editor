/**
 * Strips flags from a given prompt string
 *
 * @param {string} imagineSentenceWithFlags - The prompt string that may contain flags
 * @returns {string} The prompt string with flags removed
 */
export function stripFlagsFromPrompt(imagineSentenceWithFlags: string): string {



    return imagineSentenceWithFlags
        .split(/--[a-zA-Z]+(\s+[^\s]+)?[\s$]?/g)
        .join('')
        .trim();
}
