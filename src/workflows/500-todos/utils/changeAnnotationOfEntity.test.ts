import spaceTrim from 'spacetrim';
import { changeAnnotationOfEntity } from './changeAnnotationOfEntity';

describe(`changeAnnotationOfEntity`, () => {
    it(`will change annotation in simple file`, () => {
        const entityName = 'foo';
        const source = spaceTrim(`

          const foo = 'bar';

        `);
        const annotation = 'Hello';
        const output = spaceTrim(`

          /**
           * Hello
           */
          const foo = 'bar';

        `);

        expect(changeAnnotationOfEntity({ source, entityName, annotation })).toBe(output);
    });

    it(`will replace existing annotation in simple file`, () => {
        const entityName = 'foo';
        const source = spaceTrim(`
            /**
             * Old annotation
             */
            const foo = 'bar';
        `);
        const annotation = 'New annotation';
        const output = spaceTrim(`
            /**
             * New annotation
             */
            const foo = 'bar';
        `);

        expect(changeAnnotationOfEntity({ source, entityName, annotation })).toBe(output);
    });

    it(`will replace existing annotation in simple file`, () => {
        const entityName = 'foo';
        const source = spaceTrim(`
            /**
             * Same annotation
             */
            const foo = 'bar';
        `);
        const annotation = 'Same annotation';

        expect(changeAnnotationOfEntity({ source, entityName, annotation })).toBe(source);
    });

    it.each([
        ['const', 'const foo = "bar";'],
        ['let', 'let foo = "bar";'],
        ['var', 'var foo = "bar";'],
        ['function', 'function foo() {}'],
        ['async function', 'async function foo() {}'],
        ['class', 'class foo {}'],
        ['interface', 'interface foo {}'],
        ['type', 'type foo = {};'],
    ])(`will add annotation to %s entity`, (_, entityDeclaration) => {
        const entityName = 'foo';
        const source = spaceTrim(`
          ${entityDeclaration}
      `);
        const annotation = 'Hello';
        const output = spaceTrim(`
            /**
             * Hello
             */
            ${entityDeclaration}
        `);

        expect(changeAnnotationOfEntity({ source, entityName, annotation })).toBe(output);
    });

    it(`will change annotation in simple file`, () => {
        const entityName = 'foo';
        const source = spaceTrim(`

          const foo = 'bar';

        `);
        const annotation = spaceTrim(`
            Hello
            This is a
            Multiline annotation
        `);
        const output = spaceTrim(`

          /**
           * Hello
           * This is a
           * Multiline annotation
           */
          const foo = 'bar';

        `);

        expect(changeAnnotationOfEntity({ source, entityName, annotation })).toBe(output);
    });
});

/**
 * TODO: Test case for multiline annotation which contains jsdoc tags
 * TODO: Test case for more entities per file, the mentioned entity (in `entityName`) will be annotated, others should be ignored
 * TODO: Test case for confusing things inside an entity like /* mark etc.
 * TODO: Test case for mame nismatch, throws error when entity is not found in given `source`
 * TODO: Simmilar test case for empty `source`
 */
