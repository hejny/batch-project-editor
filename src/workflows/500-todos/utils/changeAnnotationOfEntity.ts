interface ChangeAnnotationOfEntityParams {
    source: string;
    entityName: string;
    annotation: string;
}
export function changeAnnotationOfEntity({ source, entityName, annotation }: ChangeAnnotationOfEntityParams): string {
    const lines = source.split('\n');
    const entityTypes = ['const', 'let', 'var', 'class', 'interface', 'type', 'function'];
    const entityLineIndex = lines.findIndex((line) =>
        entityTypes.some((type) => line.includes(`${type} ${entityName}`)),
    );
    if (entityLineIndex === -1) throw new Error(`Entity '${entityName}' not found in source`);

    const annotationLines = annotation.split('\n').map((line) => ` * ${line}`);
    annotationLines.unshift('/**');
    annotationLines.push(' */');

    let startInsertIndex = entityLineIndex;
    if (lines[entityLineIndex - 1] === ' */') {
        startInsertIndex -= 2;
        while (lines[startInsertIndex] !== '/**') {
            startInsertIndex--;
        }
        lines.splice(startInsertIndex, entityLineIndex - startInsertIndex);
    }

    lines.splice(startInsertIndex, 0, ...annotationLines);
    return lines.join('\n');
}
