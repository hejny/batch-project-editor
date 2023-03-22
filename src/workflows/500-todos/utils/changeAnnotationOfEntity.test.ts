import spaceTrim from 'spacetrim';
import { changeAnnotationOfEntity } from './changeAnnotationOfEntity';

describe(`changeAnnotationOfEntity`, () => {
    it(`will change annotation in simple file`, () => {
        const source = spaceTrim(`

          const foo = 'bar';

        `);
        const output = spaceTrim(`

          /**
           * Hello
           */
          const foo = 'bar';

        `);

        expect(changeAnnotationOfEntity({ source, entityName: 'foo', annotation: 'Hello' })).toBe(output);
    });
});

/**
 * TODO: !!! Test case for negative case
 * TODO: !!! Test the case when there is already an annotation in given `source`, it should be replaced by the new one
 * TODO: !!! Test the case when there is already an annotation in given `source` BUT this annotation is same as the new one - nothing should happen
 * TODO: !!! Test case for more entity types, like annotating a functions, async functions, exported entities, classes, interfaces, types,... (all possible typescript/javascript things)
 * TODO: !!! Test case for multiline annotation
 * TODO: !!! Test case for multiline annotation which contains jsdoc tags
 * TODO: !!! Test case for more entities per file, the mentioned entity (in `entityName`) will be annotated, others should be ignored
 * TODO: !!! Test case for confusing things inside an entity like /* mark etc.
 * TODO: !!! Test case for mame nismatch, throws error when entity (by `entityName`) is not found in given `source`
 * TODO: !!! Simmilar test case for empty `source`
 */
