import spaceTrim from 'spacetrim';

/**
 * Changes the annotation of a given entity in the source code.
 *
 * @param {Object} options - An options object.
 * @param {string} options.source - The source code to modify.
 * @param {string} options.entityName - The name of the entity to modify.
 * @param {string} options.annotation - The new annotation to add to the entity.
 * @returns {string} - The modified source code with the new annotation added.
 * @throws {Error} - If the entity to modify cannot be found in the source code.
 */
export function changeAnnotationOfEntity({
    source,
    entityName,
    annotation,
}: {
    source: string;
    entityName: string;
    annotation: string;
}): string {
    return spaceTrim(
        (block) => `

            ${block(source)}

            /*
            In ${entityName} there is new annotation:
                ${annotation}

            */

        `,
    );
}

/**
 * TODO: Implement by aiTDD
 */
