import spaceTrim from 'spacetrim';
import { unwrapAnnotation } from './unwrapAnnotation';

describe(`unwrapAnnotation`, () => {
    it(`will unwrap single-line annotation`, () => {
        const source = spaceTrim(`

          /**
           * Hello
           */

        `);
        const output = spaceTrim(`

          Hello

        `);

        expect(unwrapAnnotation(source)).toBe(output);
    });
});

/**
 * TODO: !!! Test case for multi-line annotation
 * TODO: !!! Test case for annotation with jsdoc
 * TODO: !!! Test case for corrupted annotation
 */
