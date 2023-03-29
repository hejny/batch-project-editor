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
    annotationWrapped?: string;
    tags: string[];
    // TODO: Detect other things like abstract, async...
}

/**
 * Parse all entities in the given (file) content
 */
export function parseEntities(content: string): Array<IEntity> {
    // TODO: Parse only entities outside of comments BUT keep annotation comments
    // content = removeComments(content);

    const entities: Array<IEntity> = [];
    for (const match of content.matchAll(
        /(?<annotationWrapped>\/\*\*((?!\/\*\*).)*?\*\/\s*)?(?:\s+export)?(?:\s+declare)?(?:\s+abstract)?(?:\s+async)?(?:\s+(?<type>[a-z]+))(?:\s+(?<name>[a-zA-Z0-9_]+))/gs,
    )) {
        const { type, name, annotationWrapped } = match.groups!;

        if (!['const', 'let', 'var', 'class', 'interface', 'type', 'function', 'enum'].includes(type)) {
            continue;
        }

        const annotation = unwrapAnnotation(annotationWrapped);
        const tags = Array.from(annotation?.match(/@([a-zA-Z0-9_-]+)*/g) || []).map((tag) => tag.replace(/^@/, ''));

        entities.push({ type: type as IEntityType, name, annotation, annotationWrapped, tags });
    }

    return entities;
}
