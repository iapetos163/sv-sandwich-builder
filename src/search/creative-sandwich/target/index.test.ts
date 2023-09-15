import { Target, refineTarget } from '.';

describe('refineTarget', () => {
  it('produces the expected number of combinations', () => {
    const target = {
      typesByPlace: [1, 8, 0],
      arbitraryTypePlaceIndices: [0, 2],
    } as Target;

    expect(refineTarget(target)).toHaveLength(272);
  });
});
