import spaceTrim from 'spacetrim';
import { removeComments } from './removeComments';

describe('removeComments', () => {
    it('should remove single-line comments', () => {
        const codeWithComments = spaceTrim(`
          function add(a: number, b: number) {
            // This function adds two numbers together
            return a + b;
          }
        `);
        const expectedCode = spaceTrim(`
          function add(a: number, b: number) {
            return a + b;
          }
        `);
        expect(removeComments(codeWithComments)).toEqual(expectedCode);
    });

    it('should remove block comments', () => {
        const codeWithComments = spaceTrim(`
          /*
          * This is a multi-line comment
          * that spans multiple lines
          */
          function subtract(a: number, b: number) {
            /*
            * This is another multi-line comment
            * that spans multiple lines
            */
            return a - b;
          }
        `);
        const expectedCode = spaceTrim(`
          function subtract(a: number, b: number) {
            return a - b;
          }
        `);
        expect(removeComments(codeWithComments)).toEqual(expectedCode);
    });

    it('should not remove comment-like strings', () => {
        const codeWithComments = spaceTrim(`
          const myString = "This is not a comment // This is just a string";
          const myRegex = /\\/\\* This is not a comment *\\//;
        `);
        expect(removeComments(codeWithComments)).toEqual(codeWithComments);
    });

    it('should handle empty input', () => {
        expect(removeComments('')).toEqual('');
    });
});
