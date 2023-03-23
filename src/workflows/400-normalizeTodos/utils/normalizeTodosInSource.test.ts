import spaceTrim from 'spacetrim';
import { normalizeTodosInSource } from './normalizeTodosInSource';

function code(source: string) {
    return spaceTrim(source).split('❗').join('!');
}

describe(`normalizeTodosInSource`, () => {
    it(`will work with important todos`, () => {
        const source = code(`

            // ❗❗❗ This need to be done

          `);
        const output = code(`

          // TODO: ❗❗❗ This need to be done

        `);

        expect(normalizeTodosInSource(source)).toBe(output);
    });

    it(`is tolerant about the colon ":"`, () => {
        const source = code(`

          // TODO ❗❗❗ This need to be done

        `);
        const output = code(`

          // TODO: ❗❗❗ This need to be done

        `);

        expect(normalizeTodosInSource(source)).toBe(output);
    });

    it(`is tolerant about the case`, () => {
        const source = code(`

          // todo: ❗❗❗ This need to be done

        `);
        const output = code(`

          // TODO: ❗❗❗ This need to be done

        `);

        expect(normalizeTodosInSource(source)).toBe(output);
    });

    it(`will work with super-important todos`, () => {
        const source = code(`

          // ❗❗❗❗ This need to be done

        `);
        const output = code(`

          // TODO: ❗❗❗❗ This need to be done

        `);

        expect(normalizeTodosInSource(source)).toBe(output);
    });

    it(`will work with super-super-super-important todos`, () => {
        const source = code(`

        // ❗❗❗❗❗❗ This need to be done

      `);
        const output = code(`

        // TODO: ❗❗❗❗❗❗ This need to be done

      `);

        expect(normalizeTodosInSource(source)).toBe(output);
    });
});

/**
 * @batch-project-editor ignore to not change TODOs here by itself
 */
