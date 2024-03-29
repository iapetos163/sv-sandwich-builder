import { MealPower, TypeIndex } from '../../../enum';
import {
  getTargetConfigs,
  permutePowerConfigs,
  TargetConfig,
} from './target-config';

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

  it('Allows for Egg power to be in the place of a repeated type', () => {
    const res = getTargetConfigs(
      [
        { mealPower: MealPower.TITLE, type: TypeIndex.FLYING, level: 1 },
        { mealPower: MealPower.ENCOUNTER, type: TypeIndex.GRASS, level: 1 },
        { mealPower: MealPower.EGG, type: TypeIndex.NORMAL, level: 1 },
      ],
      1,
    );

    const matchingEggConfig = res[2].find(
      (c) =>
        c.typeAllocation === 'ONE_ONE_THREE' &&
        c.mpPlaceIndex === 2 &&
        c.typePlaceIndex === 0,
    );
    expect(matchingEggConfig).toBeDefined();
  });

  it('Returns valid configs for duplicate Normal type powers', () => {
    const targetPowers = [
      { mealPower: 6, type: TypeIndex.NORMAL, level: 2 },
      { mealPower: 9, type: TypeIndex.NORMAL, level: 2 },
      { mealPower: 1, type: TypeIndex.FIGHTING, level: 2 },
    ];

    const res = getTargetConfigs(targetPowers, 1);
    expect(
      res[0].find((tc) => tc.typeAllocation === 'ONE_THREE_TWO'),
    ).not.toBeDefined();
  });

  it('yields results for Lv 3 Encounter Bug and Lv 3 Humungo Bug and 1 HM', () => {
    const targetPowers = [
      {
        mealPower: MealPower.ENCOUNTER,
        type: TypeIndex.BUG,
        level: 3,
      },
      {
        mealPower: MealPower.HUMUNGO,
        type: TypeIndex.BUG,
        level: 3,
      },
    ];
    const res = getTargetConfigs(targetPowers, 1);
    expect(res.length).toBeGreaterThan(0);
  });

  it('yields flexible results for Lv 3 Exp Ice and 1 HM', () => {
    const targetPowers = [
      {
        mealPower: MealPower.EXP,
        type: TypeIndex.ICE,
        level: 3,
      },
    ];
    const res = getTargetConfigs(targetPowers, 1);
    expect(res[0].length).toBeGreaterThan(1);
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

  it('Is flexible with Egg power', () => {
    const targetPowers = [
      {
        mealPower: MealPower.TITLE,
        type: TypeIndex.FLYING,
        level: 1,
      },
      {
        mealPower: MealPower.ENCOUNTER,
        type: TypeIndex.GRASS,
        level: 1,
      },
      {
        mealPower: MealPower.EGG,
        type: 0,
        level: 1,
      },
    ];

    const configs: TargetConfig[][] = [
      [
        {
          typeAllocation: 'ONE_ONE_THREE',
          typePlaceIndex: 0,
          mpPlaceIndex: 1,
        },
        {
          typeAllocation: 'ONE_THREE_TWO',
          typePlaceIndex: 0,
          mpPlaceIndex: 1,
        },
      ],
      [
        {
          typeAllocation: 'ONE_ONE_THREE',
          typePlaceIndex: 2,
          mpPlaceIndex: 3,
        },
        {
          typeAllocation: 'ONE_THREE_TWO',
          typePlaceIndex: 1,
          mpPlaceIndex: 3,
        },
        {
          typeAllocation: 'ONE_THREE_TWO',
          typePlaceIndex: 2,
          mpPlaceIndex: 2,
        },
      ],
      [
        {
          typeAllocation: 'ONE_ONE_THREE',
          typePlaceIndex: 0,
          mpPlaceIndex: 2,
        },
        {
          typeAllocation: 'ONE_ONE_THREE',
          typePlaceIndex: 2,
          mpPlaceIndex: 3,
        },
        {
          typeAllocation: 'ONE_THREE_TWO',
          typePlaceIndex: 1,
          mpPlaceIndex: 3,
        },
        {
          typeAllocation: 'ONE_THREE_TWO',
          typePlaceIndex: 2,
          mpPlaceIndex: 2,
        },
      ],
    ];

    const res = permutePowerConfigs(targetPowers, configs);

    const oneOneThreeAllocation = res.find(
      (cs) => cs[0].typeAllocation === 'ONE_ONE_THREE',
    );
    expect(oneOneThreeAllocation).toBeDefined();
  });

  it('Does not output duplicate config sets', () => {
    const targetPowers = [
      {
        mealPower: MealPower.TITLE,
        type: TypeIndex.FLYING,
        level: 1,
      },
      {
        mealPower: MealPower.ENCOUNTER,
        type: TypeIndex.GRASS,
        level: 1,
      },
      {
        mealPower: MealPower.EGG,
        type: 0,
        level: 1,
      },
    ];

    const configs: TargetConfig[][] = [
      [
        {
          typeAllocation: 'ONE_ONE_THREE',
          typePlaceIndex: 0,
          mpPlaceIndex: 1,
        },
        {
          typeAllocation: 'ONE_THREE_TWO',
          typePlaceIndex: 0,
          mpPlaceIndex: 1,
        },
      ],
      [
        {
          typeAllocation: 'ONE_ONE_THREE',
          typePlaceIndex: 2,
          mpPlaceIndex: 3,
        },
        {
          typeAllocation: 'ONE_THREE_TWO',
          typePlaceIndex: 1,
          mpPlaceIndex: 3,
        },
        {
          typeAllocation: 'ONE_THREE_TWO',
          typePlaceIndex: 2,
          mpPlaceIndex: 2,
        },
      ],
      [
        {
          typeAllocation: 'ONE_ONE_THREE',
          typePlaceIndex: 0,
          mpPlaceIndex: 2,
        },
        {
          typeAllocation: 'ONE_ONE_THREE',
          typePlaceIndex: 2,
          mpPlaceIndex: 3,
        },
        {
          typeAllocation: 'ONE_THREE_TWO',
          typePlaceIndex: 1,
          mpPlaceIndex: 3,
        },
        {
          typeAllocation: 'ONE_THREE_TWO',
          typePlaceIndex: 2,
          mpPlaceIndex: 2,
        },
      ],
    ];

    const res = permutePowerConfigs(targetPowers, configs);

    const matches = res.filter(
      (cs) =>
        cs[0].typeAllocation === 'ONE_ONE_THREE' &&
        cs[0].typePlaceIndex === 0 &&
        cs[0].mpPlaceIndex === 1 &&
        cs[1].typePlaceIndex === 2 &&
        cs[1].mpPlaceIndex === 3 &&
        cs[2].typePlaceIndex === 0 &&
        cs[2].mpPlaceIndex === 2,
    );
    expect(matches).toHaveLength(1);
  });
});
