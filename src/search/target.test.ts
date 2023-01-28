import { MealPower, rangeTypes, TypeIndex } from '../enum';
import { rankTypeBoosts } from '../mechanics';
import {
  getTargetConfigs,
  getTypeTargetsByPlace,
  permutePowerConfigs,
} from './target';

describe('getTargetConfigs', () => {
  it('Returns no more than 4 for any target config when numHerbaMystica is 1', () => {
    const res = getTargetConfigs(
      [
        { mealPower: MealPower.HUMUNGO, level: 3, type: TypeIndex.STEEL },
        { mealPower: MealPower.CATCH, level: 2, type: TypeIndex.PSYCHIC },
      ],
      1,
    );

    expect(res[0].length).toBeLessThanOrEqual(4);
    expect(res[1].length).toBeLessThanOrEqual(4);
  });
});

describe('permutePowerConfigs', () => {
  it('Returns distinct typePlaceIndexes for distinct types', () => {
    const targetPowers = [
      {
        mealPower: MealPower.EXP,
        type: TypeIndex.DRAGON,
        level: 1,
      },
      {
        mealPower: MealPower.CATCH,
        type: TypeIndex.DARK,
        level: 1,
      },
    ];
    const configs = getTargetConfigs(targetPowers, 0);
    const res = permutePowerConfigs(targetPowers, configs);
    res.forEach(([config1, config2]) => {
      expect(config1.typePlaceIndex).not.toBe(config2.typePlaceIndex);
    });
  });
});

describe('getTypeTargetsByPlace', () => {
  it('Returns a valid result', () => {
    const res = getTypeTargetsByPlace(
      [{ mealPower: 6, type: 0, level: 2 }],
      [0],
      rankTypeBoosts(rangeTypes.map(() => 0)),
    );

    expect(res[0]).toBe(0);
    expect(res[1]).toBe(1);
    expect(res[2]).toBe(2);
  });
});
