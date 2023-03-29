import spaceTrim from 'spacetrim';
import { parseEntities } from './parseEntities';

describe(`parseEntities`, () => {
    it(`will parse single entity`, () => {
        expect(
            parseEntities(
                spaceTrim(`

                    /**
                     * Foo bar
                     *
                     * @private
                     */
                    async function foo(){
                    }

                `),
            ),
        ).toEqual([
            {
                type: 'function',
                name: 'foo',
                annotation: spaceTrim(`

                  Foo bar

                  @private

                `),
                annotationWrapped: spaceTrim(`
                  /**
                   * Foo bar
                   *
                   * @private
                   */
                `),
                tags: ['private'],
            },
        ]);
    });
});
