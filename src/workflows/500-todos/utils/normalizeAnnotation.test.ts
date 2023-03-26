import spaceTrim from 'spacetrim';
import { normalizeAnnotation } from './normalizeAnnotation';

describe(`unwrapAnnotation`, () => {
    it(`will work with single message`, () => {
        expect(normalizeAnnotation(spaceTrim(`Hello`))).toBe(spaceTrim(`Hello ⁘`));
    });

    it(`will work with multiline message`, () => {
        expect(
            normalizeAnnotation(
                spaceTrim(`

                    Hello
                    Hello

                `),
            ),
        ).toBe(
            spaceTrim(`

                    Hello ⁘
                    Hello

            `),
        );
    });

    it(`will work with multiline message with dot`, () => {
        expect(
            normalizeAnnotation(
                spaceTrim(`

                    Hello
                    Hello

                `),
            ),
        ).toBe(
            spaceTrim(`

                    Hello ⁘
                    Hello

            `),
        );
    });

    it(`will work with multiline message with jsdoc`, () => {
        expect(
            normalizeAnnotation(
                spaceTrim(`

                  Hello
                  Hello
                  @returns {JSX.Element} A JSX element representing a square.

              `),
            ),
        ).toBe(
            spaceTrim(`

                  Hello ⁘
                  Hello

                  @returns {JSX.Element} A JSX element representing a square.

          `),
        );
    });

    it(`will throw error when there is no message`, () => {
        expect(() => normalizeAnnotation(`@returns {JSX.Element} A JSX element representing a square.`)).toThrowError();
    });
});
