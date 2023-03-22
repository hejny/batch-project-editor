import spaceTrim from 'spacetrim';
import { normalizeTodosInSource } from './normalizeTodosInSource';


describe(`normalizeTodosInSource`, () => {
    it(`will work with important todos`, () => {
        const source = spaceTrim(`

            // !!! This need to be done

          `);
        const output = spaceTrim(`

            // TODO: !!! This need to be done

          `);

        expect(normalizeTodosInSource(source)).toBe(output);
    });

    it(`is tolerant about the colon ":"`, () => {
        const source = spaceTrim(`

          // TODO !!! This need to be done

        `);
        const output = spaceTrim(`

          // TODO: !!! This need to be done

        `);

        expect(normalizeTodosInSource(source)).toBe(output);
    });

    it(`is tolerant about the case`, () => {
        const source = spaceTrim(`

          // todo: !!! This need to be done

        `);
        const output = spaceTrim(`

          // TODO: !!! This need to be done

        `);

        expect(normalizeTodosInSource(source)).toBe(output);
    });

    it(`will work with super-important todos`, () => {
        const source = spaceTrim(`

          // !!!! This need to be done

        `);
        const output = spaceTrim(`

          // TODO: !!!! This need to be done

        `);

        expect(normalizeTodosInSource(source)).toBe(output);
    });

    it(`will work with super-super-super-important todos`, () => {
        const source = spaceTrim(`

        // !!!!!! This need to be done

      `);
        const output = spaceTrim(`

        // TODO: !!!!!! This need to be done

      `);

        expect(normalizeTodosInSource(source)).toBe(output);
    });
});


/**
 * @batch-project-editor ignore to not change TODOs here by itself
 */