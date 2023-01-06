/**
 * Strips flags from a given prompt string
 *
 * @param {string} imagineSentenceWithFlags - The prompt string that may contain flags
 * @returns {string} The prompt string with flags removed
 */
export function stripFlagsFromPrompt(imagineSentenceWithFlags: string): string {
    let words = [];
    let isFlag = false;

    for (const word of imagineSentenceWithFlags.split(' ').filter((word) => word !== '')) {
        if (isFlag) {
            isFlag = false;
            continue;
        }

        if (word.startsWith('--')) {
            isFlag = true;
            continue;
        }

        words.push(word);
    }

    return words.join(' ');
}

/**
 * TODO: Maybe better to do this via RegExp instead but I can not figure out how to, in commit 1bba918b74f511d5925f858d389210d498d55a35 there is a draft of it
 */
