import { getMidjourneyLink } from './getMidjourneyLink';

describe(`getMidjourneyLink`, () => {
    it(`gets Midjourney link from basename`, () => {
        expect(getMidjourneyLink(`0e59ac00-1954-4884-982e-feb7a29ad312-0_0`).href).toBe(
            `https://www.midjourney.com/app/jobs/0e59ac00-1954-4884-982e-feb7a29ad312`,
        );
        expect(getMidjourneyLink(`0e59ac00-1954-4884-982e-feb7a29ad312`).href).toBe(
            `https://www.midjourney.com/app/jobs/0e59ac00-1954-4884-982e-feb7a29ad312`,
        );
    });
    it(`gets Midjourney link from absolute path`, () => {
        expect(
            getMidjourneyLink(`C://a/b/c/assets/ai/wallpaper/gallery/0e59ac00-1954-4884-982e-feb7a29ad312-0_0.png`)
                .href,
        ).toBe(`https://www.midjourney.com/app/jobs/0e59ac00-1954-4884-982e-feb7a29ad312`);
    });

    it(`gets Midjourney link from relative path`, () => {
        expect(getMidjourneyLink(`assets/ai/wallpaper/gallery/0e59ac00-1954-4884-982e-feb7a29ad312-0_0.png`).href).toBe(
            `https://www.midjourney.com/app/jobs/0e59ac00-1954-4884-982e-feb7a29ad312`,
        );
    });
});
