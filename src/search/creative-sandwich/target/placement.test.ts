import { getTypeTargetsByPlace } from './placement';

describe('getTypeTargetsByPlace', () => {
  it('Returns a valid result', () => {
    const res = getTypeTargetsByPlace(
      [{ mealPower: 6, type: 0, level: 2 }],
      [0],
    );

    expect(res[0]).toBe(0);
    expect(res[1]).toBe(null);
    expect(res[2]).toBe(null);
  });
});
