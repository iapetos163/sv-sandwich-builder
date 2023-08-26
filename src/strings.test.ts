import { MealPower, TypeIndex } from './enum';
import { getPowerCopy } from './strings';

describe('mealPowerCopy', () => {
  it('correctly represents egg power', () => {
    const copy = getPowerCopy({
      mealPower: MealPower.EGG,
      type: TypeIndex.NORMAL,
      level: 2,
    });

    expect(copy.endsWith('Egg Power')).toBe(true);
  });
});
