import { MealPower, TypeIndex } from '@/enum';
import { TargetPower } from '@/types';
import { getRecipesForPowers } from './recipe';

describe('getRecipesForPowers', () => {
  it('correctly matches the target level', () => {
    const targetPowers: TargetPower[] = [
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
