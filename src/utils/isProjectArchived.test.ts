import { isProjectArchived } from './isProjectArchived';

describe(`detection if the project is archived on github`, () => {
    it(`is archived`, async () => {
      expect(await isProjectArchived(new URL(`https://github.com/hejny/writer`))).toBe(true);
        expect(await isProjectArchived(new URL(`https://github.com/collboard/robothon`))).toBe(true);
    });

    it(`is NOT archived`, async () => {
      expect(await isProjectArchived(new URL(`https://github.com/hejny/batch-project-editor `))).toBe(false);
        expect(await isProjectArchived(new URL(`https://github.com/collboard/collboard`))).toBe(false);
    });
});

/**
 * TODO: [🐩] Test also combinations of archived, fork and private
 */