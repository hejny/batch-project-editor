import { removeComments } from './removeComments';
import { unwrapAnnotation } from './unwrapAnnotation';

/**
 * All possible entity types in javascript and typescript
 */
export type IEntityType = 'const' | 'let' | 'class' | 'function' | 'interface' | 'type' /* <- TODO: More */;

/**
 *  Metadata of entity in javascript and typescript
 */
export interface IEntity {
    type: IEntityType;
    name: string;
    annotation?: string;
    tags: string[];
    // TODO: Detect other things like abstract, async...
}

/**
 * Parse all entities in the given (file) content
 */
export function parseEntities(content: string): Array<IEntity> {
    content = removeComments(content);

    const entities: Array<IEntity> = [];
    for (const match of content.matchAll(
        /(?<annotation>\/\*\*((?!\/\*\*).)*?\*\/\s*)?(?:\s+export)?(?:\s+declare)?(?:\s+abstract)?(?:\s+async)?(?:\s+(?<type>[a-z]+))(?:\s+(?<name>[a-zA-Z0-9_]+))/gs,
    )) {
        const { type, name, annotation } = match.groups!;

        const tags = Array.from(annotation?.match(/@([a-zA-Z0-9_-]+)*/g) || []);

        if (!['const', 'let', 'var', 'class', 'interface', 'type', 'function', 'enum'].includes(type)) {
            continue;
        }
        entities.push({ type: type as IEntityType, name, annotation: unwrapAnnotation(annotation), tags });
    }

    return entities;
}

/**
 * TODO: !!!! Remove comments in parseEntities
 * TODO: !!!! Entity type untrimmend?!
 *       "⚠ In response there is no  type attribute_value"
 */
