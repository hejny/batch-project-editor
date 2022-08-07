import { patternToRegExp } from './patternToRegExp';

describe('how conversion on wildcard patter to regexp works', () => {
    it('works in simple cases', () => {
        expect(patternToRegExp('aaa')).toEqual(/^aaa$/);
        expect(patternToRegExp('aaa*')).toEqual(/^aaa.*$/);

        expect(patternToRegExp('aaa*bbb*ccc*ddd')).toEqual(/^aaa.*bbb.*ccc.*ddd$/);
    });

    it('works with escaping', () => {
        expect(patternToRegExp('aaa/*')).toEqual(/^aaa\/.*$/);
        expect(patternToRegExp('a(a)a/*')).toEqual(/^a\(a\)a\/.*$/);
    });

    it('works with multiple patterns', () => {
        expect(patternToRegExp('aaa', 'bbb')).toEqual(/^(aaa|bbb)$/);
        expect(patternToRegExp('aaa*', 'bbb')).toEqual(/^(aaa.*|bbb)$/);
    });
});
