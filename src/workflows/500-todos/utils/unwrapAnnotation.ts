import spaceTrim from "spacetrim";

export function unwrapAnnotation(annotation: string): string {
    const lines = annotation.split('\n');
    let output = '';
    for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();
        if (line.startsWith('*')) {
            output += line.slice(1).trim().replace(/\/$/, '') + '\n';
        }
    }
    return spaceTrim(output);
}

/**
 * TODO: Implement by aiTDD
 */
