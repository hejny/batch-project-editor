/**
 * The options object for the changeAnnotationOfEntity function.
 */
interface ChangeAnnotationOfEntityParams {
    /**
     * The source code to update.
     */
    source: string;

    /**
     * The name of the entity to update the annotation for.
     */
    entityName: string;

    /**
     * The new annotation to add to the entity.
     */
    annotation: string;
}

/**
 * Changes the annotation of a specified entity in the given source code.
 * @param {ChangeAnnotationOfEntityParams} options - The options object.
 * @returns {string} The updated source code with the new annotation added to the specified entity.
 * @throws {Error} Throws an error if the specified entity is not found in the given source code.
 */
export function changeAnnotationOfEntity(options: ChangeAnnotationOfEntityParams): string {
    const { source, entityName, annotation } = options;

    if (annotation.includes('*/')) {
        // TODO: Maybe use here removeComments
        throw new Error(`Annotation can not contain comments`);
    }

    const lines = source.split('\n');
    const entityTypes = ['const', 'let', 'var', 'class', 'interface', 'type', 'function', 'enum'];
    const entityLineIndex = lines.findIndex((line) =>
        entityTypes.some((type) => new RegExp(`(\\s|^)${type}\\s+${entityName}`).test(line)),
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
