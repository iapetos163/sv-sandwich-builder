import { MealPower, TypeIndex } from '@/enum';
import { Power } from '@/types';
import { getRecipesForPowers } from './recipe';

describe('getRecipesForPowers', () => {
  it('correctly matches the target level', () => {
    const targetPowers: Power[] = [
      {
        mealPower: MealPower.EGG,
        type: TypeIndex.NORMAL,
        level: 2,
      },
    ];
    const res = getRecipesForPowers(targetPowers);

    expect(res.find((r) => r.number === '12')).not.toBeDefined();
  });
});
