import { removeDependencyPrefix } from './removeDependencyPrefix';

describe('how removing od dependency prefix works', () => {
    it('does nothing on valid semver without prefix', () => {
        expect(removeDependencyPrefix('1.0.0')).toBe('1.0.0');
    });

    it('removes a prefix', () => {
        expect(removeDependencyPrefix('^1.0.0')).toBe('1.0.0');
        expect(removeDependencyPrefix('~1.0.0')).toBe('1.0.0');
    });
});
