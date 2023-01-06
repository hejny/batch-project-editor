/**
 * Removes URLs from a given text.
 *
 * @param {string} text - The input text.
 * @returns {string} The text with URLs removed.
 */
export function stripsLinks(text: string): string {
    return text.replace(
        /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_+.~#?&//=]*)/gi,
        '',
    );
}

/**
 * @generator https://chat.openai.com/chat/6ef1eeb8-0955-40a9-9feb-a78bceecd1c6
 */