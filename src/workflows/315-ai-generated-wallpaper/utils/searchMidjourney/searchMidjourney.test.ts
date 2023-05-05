import { searchFromDownloaded, searchMidjourney } from './searchMidjourney';

describe(`searchMidjourney`, () => {
    /*
    TODO: Make some simple version:
    it(`should find the result`, async () => {
        const result = await searchMidjourney({ prompt: `cave`, version: 4 });
        expect(result.length).toBeGreaterThanOrEqual(1);
    });
    */

    it(`should find the result from downloaded`, async () => {
        const result = await searchFromDownloaded({
            prompt: `Background frames like papers (A4, A3,...), screens, etc. for virtual online whiteboard`,
            version: null,
            isRetrying: false,
        });
        expect(result.length).toBeGreaterThanOrEqual(1);
    });

    it(`should find the result without version`, async () => {
        const result = await searchMidjourney({
            prompt: `Background frames like papers (A4, A3,...), screens, etc. for virtual online whiteboard`,
            version: null,
            isRetrying: false,
        });
        expect(result.length).toBeGreaterThanOrEqual(1);
    });

    it(`should find the result with version`, async () => {
        const result = await searchMidjourney({
            prompt: `Background frames like papers (A4, A3,...), screens, etc. for virtual online whiteboard`,
            version: 4,
            isRetrying: false,
        });

        console.log(result);
        expect(result.length).toBeGreaterThanOrEqual(1);
    });

    it(`should NOT find the result`, async () => {
        const result = await searchMidjourney({ prompt: `aegfsdiyfguy`, version: 4, isRetrying: false });
        expect(result.length).toBe(0);
    });
});
