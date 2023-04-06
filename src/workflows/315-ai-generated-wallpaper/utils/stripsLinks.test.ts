import { stripsLinks } from './stripsLinks';

describe('stripsLinks', () => {
    it('removes URLs from text with a single link', () => {
        expect(stripsLinks('Check out this link: https://www.example.com')).toBe('Check out this link: ');
    });

    it('removes URLs from text with multiple links', () => {
        expect(stripsLinks('Check out these links: https://www.example.com and https://www.another-example.com')).toBe(
            'Check out these links:  and ',
        );
    });

    it('does not remove non-URL text', () => {
        expect(stripsLinks('This text does not contain any links.')).toBe('This text does not contain any links.');
    });
});

/**
 * @see https://chat.openai.com/chat/6ef1eeb8-0955-40a9-9feb-a78bceecd1c6
 */
