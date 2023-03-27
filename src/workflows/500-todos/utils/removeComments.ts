export function removeComments(code: string): string {
    // Regular expression to match comments in the code
    const commentRegex = /\/\*[\s\S]*?\*\/|\/\/.*/g;

    // Remove all instances of comments from the code
    const codeWithoutComments = code.replace(commentRegex, '');

    return codeWithoutComments;
}
