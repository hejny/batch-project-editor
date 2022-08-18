import markdownToTxt from 'markdown-to-txt';

export function markdownToTxtEnhanced(markdown: string): string {
    const almostText = markdownToTxt(markdown);

    const text = almostText.replace(/\[([^\]]+)\]\([^)]+\)/g, '$1');

    return text;
}

/**
 * TODO: Replace all
 */
