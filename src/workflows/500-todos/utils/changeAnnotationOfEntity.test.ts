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

    it(`will change annotation in simple file to include JSDoc tags`, () => {
        const entityName = 'foo';
        const source = spaceTrim(`

          const foo = 'bar';

        `);
        const annotation = spaceTrim(`

          This is a function.
          @param {string} bar - A string param.
          @return {string} This is the result of the function.

        `);
        const output = spaceTrim(`

          /**
           * This is a function.
           * @param {string} bar - A string param.
           * @return {string} This is the result of the function.
           */
          const foo = 'bar';

        `);

        expect(changeAnnotationOfEntity({ source, entityName, annotation })).toBe(output);
    });

    it(`will change annotation of specific entity in file with multiple entities`, () => {
        const entityName = 'foo';
        const source = spaceTrim(`

          const foo = 'bar';
          let baz = 42;
          var qux = true;

        `);
        const annotation = 'Hello';
        const output = spaceTrim(`

          /**
           * Hello
           */
          const foo = 'bar';
          let baz = 42;
          var qux = true;

        `);

        expect(changeAnnotationOfEntity({ source, entityName, annotation })).toBe(output);
    });

    it(`will change annotation of entity with potentially confusing characters`, () => {
        const entityName = 'foo';
        const source = spaceTrim(`

          const foo = '/* mark */';

        `);
        const annotation = 'Hello';
        const output = spaceTrim(`

          /**
           * Hello
           */
          const foo = '/* mark */';

        `);

        expect(changeAnnotationOfEntity({ source, entityName, annotation })).toBe(output);
    });

    it(`will change annotation with potentially confusing characters`, () => {
        const entityName = 'foo';
        const source = spaceTrim(`

          const foo = 'bar';

        `);
        const annotation = 'Hello /* world */';
        const output = spaceTrim(`

          /**
           * Hello /* world */
           */
          const foo = 'bar';

        `); /* <- TODO: This is not an ideal solution, nested annotation should be escaped, fix this test+implementation */

        expect(changeAnnotationOfEntity({ source, entityName, annotation })).toBe(output);
    });

    it(`will throw error when entity is not found in source`, () => {
        const entityName = 'foo';
        const source = spaceTrim(`

          const bar = 'baz';

        `);
        const annotation = 'Hello';

        expect(() => changeAnnotationOfEntity({ source, entityName, annotation })).toThrowError(
            `Entity '${entityName}' not found in source`,
        );
    });

    it(`will throw error when source is empty`, () => {
        const entityName = 'foo';
        const source = '';
        const annotation = 'Hello';

        expect(() => changeAnnotationOfEntity({ source, entityName, annotation })).toThrowError(
            `Entity '${entityName}' not found in source`,
        );
    });
});
