export function normalizeChatRequestText(requestText: string): string {
    return requestText.split('\n').join(' ').split(/\s+/g).join(' '); /* <- TODO: How to input code + multiline text */
}
