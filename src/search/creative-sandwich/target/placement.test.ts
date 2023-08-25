import { MealPower, TypeIndex } from '@/enum';
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

  it('Handles a repeated typePlaceIndex where one power is typeless', () => {
    const targetPowers = [
      {
        mealPower: MealPower.EGG,
        type: TypeIndex.NORMAL,
        level: 2,
      },
      {
        mealPower: MealPower.TITLE,
        type: TypeIndex.FAIRY,
        level: 2,
      },
      {
        mealPower: MealPower.RAID,
        type: TypeIndex.NORMAL,
        level: 2,
      },
    ];
    const res = getTypeTargetsByPlace(targetPowers, [0, 0, 2]);

    expect(res).toContain(TypeIndex.FAIRY);
  });
});
