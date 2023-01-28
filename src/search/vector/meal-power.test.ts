import { MealPower, TypeIndex } from '../../enum';
import {
  getTargetMealPowerVector,
  sortTargetPowersByMpPlace,
} from './meal-power';

describe('getTargetMealPowerVector', () => {
  it('Does not output zero when given a zero vector', () => {
    const v = getTargetMealPowerVector({
      targetPowers: [
        {
          mealPower: MealPower.TEENSY,
          type: TypeIndex.STEEL,
          level: 3,
        },
      ],
      targetConfigSet: [
        {
          config: 'ONE_ONE_THREE',
          typePlaceIndex: 0,
          mpPlaceIndex: 2,
        },
      ],
      rankedMealPowerBoosts: [],
      mealPowerVector: [],
    });
    expect(v[8]).toBeGreaterThan(0);
  });
  it('Does not attempt to force positioning', () => {
    const v = getTargetMealPowerVector({
      targetPowers: [
        {
          mealPower: MealPower.TEENSY,
          type: TypeIndex.STEEL,
          level: 3,
        },
      ],
      targetConfigSet: [
        {
          config: 'ONE_ONE_THREE',
          typePlaceIndex: 0,
          mpPlaceIndex: 2,
        },
      ],
      rankedMealPowerBoosts: [],
      mealPowerVector: [],
    });
    expect(v[0]).toBe(0);
  });
  it('Does not output zero when given Egg power and zero', () => {
    const v = getTargetMealPowerVector({
      targetPowers: [
        {
          mealPower: MealPower.EGG,
          type: TypeIndex.STEEL,
          level: 3,
        },
      ],
      targetConfigSet: [
        {
          config: 'ONE_ONE_THREE',
          typePlaceIndex: 0,
          mpPlaceIndex: 2,
        },
      ],
      rankedMealPowerBoosts: [],
      mealPowerVector: [],
    });
    expect(v[0]).toBeGreaterThan(0);
  });
});

describe('sortTargetPowersByMpPlace', () => {
  it('Sorts in descending order', () => {
    const res = sortTargetPowersByMpPlace(
      [
        {
          mealPower: MealPower.EGG,
          type: TypeIndex.STEEL,
          level: 3,
        },
        {
          mealPower: MealPower.TITLE,
          type: TypeIndex.STEEL,
          level: 3,
        },
      ],
      [
        {
          config: 'ONE_ONE_THREE',
          typePlaceIndex: 0,
          mpPlaceIndex: 2,
        },
        {
          config: 'ONE_ONE_THREE',
          typePlaceIndex: 0,
          mpPlaceIndex: 1,
        },
      ],
    );

    expect(res[0][1]).toBe(2);
    expect(res[1][1]).toBe(1);
  });
});
