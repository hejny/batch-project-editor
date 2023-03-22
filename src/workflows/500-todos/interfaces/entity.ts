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
    anotation?: string;
    tags: string[];
    // TODO: Detect other things like abstract, async...
}