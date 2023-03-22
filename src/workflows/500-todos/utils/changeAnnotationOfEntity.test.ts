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
 * TODO: !!! Test case for more entity types
 * TODO: !!! Test case for multiline annotation
 * TODO: !!! Test case for more entities per file
 * TODO: !!! Test case for confusing things inside an entity like /* mark etc.
 * TODO: !!! Test case for mame nismatch
 */
