import { getMpScoreWeight, getTypeScoreWeight } from './select-ingredient';

describe('getTypeScoreWeight', () => {
  it('Initially weighs level over meal power', () => {
    const levelWeight = getTypeScoreWeight({
      targetVector: [0, 0, 0, 0, 0, 0, 180, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      deltaVector: [0, 0, 0, 0, 0, 0, 180, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      currentVector: [],
      remainingFillings: 6,
      remainingCondiments: 4,
    });

    const mpWeight = getMpScoreWeight({
      targetVector: [1, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      deltaVector: [1, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      currentVector: [],
      remainingFillings: 6,
      remainingCondiments: 4,
    });

    expect(levelWeight).toBeGreaterThan(mpWeight);
  });
});
