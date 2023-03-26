import spaceTrim from 'spacetrim';
import { AUTOMATED_ANNOTATION_MARK } from '../onceWriteAnnotations';

export function normalizeAnnotation(annotation: string): string {
    const newLines = [];

    let isMarkAdded = false;
    let isJsdoc = false;

    for (let line of annotation.split('\n')) {
        line = line.trim();

        if (!isJsdoc && line.startsWith('@')) {
            newLines.push('');
            isJsdoc = true;
        }

        if (!isMarkAdded) {
            if (isJsdoc) {
                throw new Error(`Annotation must contain at least one line of human text`);
            }

            line.replace(/\.$/, '');
            line += AUTOMATED_ANNOTATION_MARK;

            isMarkAdded = true;
        }

        newLines.push(line);
    }

    return spaceTrim(newLines.join(`\n`));
}
