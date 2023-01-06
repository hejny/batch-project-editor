import { stripFlagsFromPrompt } from './stripFlagsFromPrompt';

describe(`stripFlagsFromPrompt`, () => {
    it(`strip flags from thr prompt`, () => {
        expect(stripFlagsFromPrompt(`Background --wallpaper`)).toEqual(`Background`);
        expect(stripFlagsFromPrompt(`Background --wallpaper     `)).toEqual(`Background`);
        expect(stripFlagsFromPrompt(`    Background --wallpaper     `)).toEqual(`Background`);
        expect(stripFlagsFromPrompt(`Background --wallpaper foo  `)).toEqual(`Background`);
        expect(stripFlagsFromPrompt(`Background --wallpaper     foo  `)).toEqual(`Background`);
        expect(stripFlagsFromPrompt(`Background --wallpaper   foo  bar`)).toEqual(`Background bar`);
    });

    it(`strip multiple flags from the prompt`, () => {
        expect(
            stripFlagsFromPrompt(
                `Background frames like papers (A4, A3,...), screens, etc. for virtual online whiteboard --version 4 --version 4 --aspect 3:2 --v 4 --q 2 `,
            ),
        ).toEqual(`Background frames like papers (A4, A3,...), screens, etc. for virtual online whiteboard`);
    });

    it(`preserve flagless prompt`, () => {
        expect(stripFlagsFromPrompt(`Hello`)).toEqual(`Hello`);
    });
});
