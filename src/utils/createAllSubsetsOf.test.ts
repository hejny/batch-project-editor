import { createAllSubsetsOf } from './createAllSubsetsOf';

describe(`permitations`, () => {
    it(`permitates empty array`, () => {
        expect(createAllSubsetsOf()).toEqual([]);
    });

    it(`permitates single-member array`, () => {
        expect(createAllSubsetsOf(1)).toEqual([[], [1]]);
    });

    it(`permitates two-member array`, () => {
        expect(createAllSubsetsOf(1, 2)).toEqual([[], [1], [2], [1, 2]]);
    });

    it(`permitates multi-member array`, () => {
        expect(createAllSubsetsOf(1, 2, 3)).toEqual([[], [1], [2], [3], [1, 2], [1, 3], [2, 3], [1, 2, 3]]);
    });
});
