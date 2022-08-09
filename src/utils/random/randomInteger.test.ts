import { randomInteger } from './randomInteger';

describe('how generating of random integer works', () => {
    it(`can work as coin`, () => {
        const numbers = new Set();
        for (let i = 0; i < 1000; i++) {
            numbers.add(randomInteger(0, 1));
        }

        expect(numbers.has(0)).toBe(true);
        expect(numbers.has(1)).toBe(true);

        expect(numbers.has(-1)).toBe(false);
        expect(numbers.has(2)).toBe(false);
    });

    it(`can work as dice`, () => {
        const numbers = new Set();
        for (let i = 0; i < 1000; i++) {
            numbers.add(randomInteger(1, 6));
        }

        expect(numbers.has(1)).toBe(true);
        expect(numbers.has(2)).toBe(true);
        expect(numbers.has(3)).toBe(true);
        expect(numbers.has(4)).toBe(true);
        expect(numbers.has(5)).toBe(true);
        expect(numbers.has(6)).toBe(true);

        expect(numbers.has(-1)).toBe(false);
        expect(numbers.has(0)).toBe(false);
        expect(numbers.has(7)).toBe(false);
        expect(numbers.has(1000)).toBe(false);
        expect(numbers.has(NaN)).toBe(false);
    });

    it(`can work with negative input`, () => {
        const numbers = new Set();
        for (let i = 0; i < 1000; i++) {
            numbers.add(randomInteger(-1, 1));
        }

        expect(numbers.has(1)).toBe(true);
        expect(numbers.has(0)).toBe(true);
        expect(numbers.has(1)).toBe(true);

        expect(numbers.has(-2)).toBe(false);
        expect(numbers.has(2)).toBe(false);
    });

    it(`can work with flipped input`, () => {
        const numbers = new Set();
        for (let i = 0; i < 1000; i++) {
            numbers.add(randomInteger(-1, 2));
        }

        expect(numbers.has(3)).toBe(false);
        expect(numbers.has(2)).toBe(true);
        expect(numbers.has(1)).toBe(true);
        expect(numbers.has(0)).toBe(true);
        expect(numbers.has(1)).toBe(true);
        expect(numbers.has(-2)).toBe(false);
    });
});
