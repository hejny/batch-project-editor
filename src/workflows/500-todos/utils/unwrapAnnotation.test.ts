import spaceTrim from 'spacetrim';
import { unwrapAnnotation } from './unwrapAnnotation';

describe(`unwrapAnnotation`, () => {
    it(`will unwrap simple single-line annotation`, () => {
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

    it(`will unwrap simple different single-line annotation`, () => {
        const source = spaceTrim(`

        /**
         * Hello world
         */

      `);
        const output = spaceTrim(`

        Hello world

      `);

        expect(unwrapAnnotation(source)).toBe(output);
    });
});

/**
 * TODO: Test case for multi-line annotation
 * TODO: Test case for annotation with jsdoc
 * TODO: Test case for corrupted annotation
 */
