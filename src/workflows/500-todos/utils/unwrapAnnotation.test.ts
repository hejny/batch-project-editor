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

    it(`will unwrap multi-line annotation`, () => {
        const source = spaceTrim(`

          /**
           * Hello
           * World
           */

        `);
        const output = spaceTrim(`

          Hello
          World

        `);

        expect(unwrapAnnotation(source)).toBe(output);
    });

    it(`will unwrap JSDoc annotation`, () => {
        const source = spaceTrim(`
            /**
             * @function
             * @name myFunction
             * @description This is my function.
             */
        `);
        const output = spaceTrim(`
            @function
            @name myFunction
            @description This is my function.
        `);

        expect(unwrapAnnotation(source)).toBe(output);
    });

    it(`will throw error for corrupted annotation`, () => {
        const source = spaceTrim(`
          /**
           * @function
           * @name myFunction
           * @description This is my function.
      `);

        expect(() => unwrapAnnotation(source)).toThrowError('Corrupted annotation');
    });
});

/**
 * TODO: Test case for corrupted annotation - more examples or corrupted annotation
 */
