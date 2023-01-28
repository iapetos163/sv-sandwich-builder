import { MealPower, rangeTypes, TypeIndex } from '../../../enum';
import { rankTypeBoosts, TypeBoost } from '../../../mechanics';
import { Power } from '../../../types';
import { norm } from '../../../vector-math';
import { getTypeTargetsByPlace } from '../target';
import { getTargetLevelVector, getTargetTypeVector } from './type-vector';

describe('getTargetTypeVector', () => {
  it('Creates a vector with the correct components for Ground', () => {
    const targetPowers: Power[] = [
      {
        mealPower: MealPower.EXP,
        type: TypeIndex.GROUND,
        level: 1,
      },
    ];
    const rankedTypeBoosts: TypeBoost[] = [];
    const v = getTargetTypeVector({
      targetPowers,
      targetConfigSet: [
        {
          config: 'ONE_THREE_TWO',
          mpPlaceIndex: 0,
          typePlaceIndex: 0,
        },
      ],
      targetTypeIndices: getTypeTargetsByPlace(
        targetPowers,
        [0],
        rankedTypeBoosts,
      ),
      rankedTypeBoosts,
      typeVector: [],
    });
    expect(v[4]).toBeGreaterThan(0);
    expect(v[0]).toBe(0);
  });

  it('Handles a zero vector and typePlaceIndex > 0', () => {
    const targetPowers: Power[] = [
      {
        mealPower: MealPower.EXP,
        type: TypeIndex.GHOST,
        level: 3,
      },
    ];
    const rankedTypeBoosts: TypeBoost[] = [];
    const v = getTargetTypeVector({
      targetPowers,
      targetConfigSet: [
        {
          config: 'ONE_THREE_TWO',
          typePlaceIndex: 2,
          mpPlaceIndex: 2,
        },
      ],
      targetTypeIndices: getTypeTargetsByPlace(
        targetPowers,
        [2],
        rankedTypeBoosts,
      ),
      rankedTypeBoosts,
      typeVector: [],
    });
    expect(v[0]).toBe(2);
    expect(v[1]).toBe(2);
    expect(v[2]).toBe(0);
    expect(v[7]).toBe(1);
  });

  it('Handles a placing below desired rank (>0) in a tie', () => {
    const targetPowers: Power[] = [
      {
        mealPower: MealPower.EXP,
        type: TypeIndex.GRASS,
        level: 3,
      },
    ];
    const rankedTypeBoosts: TypeBoost[] = [
      { type: TypeIndex.FLYING, amount: 36 },
      { type: TypeIndex.ROCK, amount: 36 },
      { type: TypeIndex.STEEL, amount: 36 },
      { type: TypeIndex.GRASS, amount: 36 },
      { type: TypeIndex.ICE, amount: 36 },
      { type: TypeIndex.FAIRY, amount: 36 },
    ];
    const v = getTargetTypeVector({
      targetPowers,
      targetConfigSet: [
        {
          config: 'ONE_THREE_TWO',
          typePlaceIndex: 2,
          mpPlaceIndex: 2,
        },
      ],
      targetTypeIndices: getTypeTargetsByPlace(
        targetPowers,
        [2],
        rankedTypeBoosts,
      ),
      rankedTypeBoosts,
      typeVector: [0, 0, 36, 0, 0, 36, 0, 0, 36, 0, 0, 36, 0, 0, 36, 0, 0, 36],
    });
    expect(v[2]).toBe(38);
    expect(v[5]).toBe(38);
    expect(v[8]).toBe(36);
    expect(v[11]).toBe(37);
    expect(v[14]).toBe(36);
    expect(v[17]).toBe(36);
  });

  it('Handles a placing below desired rank 0 in a tie', () => {
    const targetPowers: Power[] = [
      {
        mealPower: MealPower.EXP,
        type: TypeIndex.GRASS,
        level: 1,
      },
    ];
    const rankedTypeBoosts: TypeBoost[] = [
      { type: TypeIndex.FLYING, amount: 36 },
      { type: TypeIndex.ROCK, amount: 36 },
      { type: TypeIndex.STEEL, amount: 36 },
      { type: TypeIndex.GRASS, amount: 36 },
      { type: TypeIndex.ICE, amount: 36 },
      { type: TypeIndex.FAIRY, amount: 36 },
    ];
    const v = getTargetTypeVector({
      targetPowers,
      targetConfigSet: [
        {
          config: 'ONE_THREE_TWO',
          typePlaceIndex: 0,
          mpPlaceIndex: 0,
        },
      ],
      targetTypeIndices: getTypeTargetsByPlace(
        targetPowers,
        [0],
        rankedTypeBoosts,
      ),
      rankedTypeBoosts,
      typeVector: [0, 0, 36, 0, 0, 36, 0, 0, 36, 0, 0, 36, 0, 0, 36, 0, 0, 36],
    });
    expect(v[2]).toBe(36);
    expect(v[5]).toBe(36);
    expect(v[8]).toBe(36);
    expect(v[11]).toBe(37);
    expect(v[14]).toBe(36);
    expect(v[17]).toBe(36);
  });

  it('Handles a placing above desired rank (>0) in a tie', () => {
    const targetPowers: Power[] = [
      {
        mealPower: MealPower.EXP,
        type: TypeIndex.FLYING,
        level: 3,
      },
    ];
    const rankedTypeBoosts: TypeBoost[] = [
      { type: TypeIndex.FLYING, amount: 36 },
      { type: TypeIndex.ROCK, amount: 36 },
      { type: TypeIndex.STEEL, amount: 36 },
      { type: TypeIndex.GRASS, amount: 36 },
      { type: TypeIndex.ICE, amount: 36 },
      { type: TypeIndex.FAIRY, amount: 36 },
    ];
    const v = getTargetTypeVector({
      targetPowers,
      targetConfigSet: [
        {
          config: 'ONE_THREE_TWO',
          typePlaceIndex: 2,
          mpPlaceIndex: 2,
        },
      ],
      targetTypeIndices: getTypeTargetsByPlace(
        targetPowers,
        [2],
        rankedTypeBoosts,
      ),
      rankedTypeBoosts,
      typeVector: [0, 0, 36, 0, 0, 36, 0, 0, 36, 0, 0, 36, 0, 0, 36, 0, 0, 36],
    });
    expect(v[2]).toBe(36);
    expect(v[5]).toBe(37);
    expect(v[8]).toBe(37);
    expect(v[11]).toBe(36);
    expect(v[14]).toBe(36);
    expect(v[17]).toBe(36);
  });

  it('Handles a placing above desired rank (>0) in a tie with another ahead', () => {
    const targetPowers: Power[] = [
      {
        mealPower: MealPower.EXP,
        type: TypeIndex.FLYING,
        level: 3,
      },
    ];
    const rankedTypeBoosts: TypeBoost[] = [
      { type: TypeIndex.NORMAL, amount: 40 },
      { type: TypeIndex.FLYING, amount: 36 },
      { type: TypeIndex.ROCK, amount: 36 },
      { type: TypeIndex.STEEL, amount: 36 },
      { type: TypeIndex.GRASS, amount: 36 },
      { type: TypeIndex.ICE, amount: 36 },
      { type: TypeIndex.FAIRY, amount: 36 },
    ];
    const v = getTargetTypeVector({
      targetPowers,
      targetConfigSet: [
        {
          config: 'ONE_THREE_TWO',
          typePlaceIndex: 2,
          mpPlaceIndex: 2,
        },
      ],
      targetTypeIndices: getTypeTargetsByPlace(
        targetPowers,
        [2],
        rankedTypeBoosts,
      ),
      rankedTypeBoosts,
      typeVector: [40, 0, 36, 0, 0, 36, 0, 0, 36, 0, 0, 36, 0, 0, 36, 0, 0, 36],
    });
    expect(v[0]).toBe(40);
    expect(v[2]).toBe(36);
    expect(v[5]).toBe(37);
    expect(v[8]).toBe(36);
    expect(v[11]).toBe(36);
    expect(v[14]).toBe(36);
    expect(v[17]).toBe(36);
  });

  it('Does not return infinity when given a zero vector', () => {
    const v = getTargetTypeVector({
      targetPowers: [
        { mealPower: MealPower.EXP, type: TypeIndex.ICE, level: 3 },
      ],
      targetConfigSet: [
        {
          config: 'ONE_ONE_THREE',
          typePlaceIndex: 0,
          mpPlaceIndex: 2,
        },
      ],
      rankedTypeBoosts: [],
      targetTypeIndices: [14, 0, 1],
      typeVector: [],
    });
    expect(norm(v)).toBeLessThan(Infinity);
  });

  it('Does not return infinity when targeting ONE_ONE_THREE and having added one herba mystica', () => {
    const v = getTargetTypeVector({
      targetPowers: [
        { mealPower: MealPower.EXP, type: TypeIndex.ICE, level: 3 },
      ],
      targetConfigSet: [
        {
          config: 'ONE_ONE_THREE',
          typePlaceIndex: 0,
          mpPlaceIndex: 2,
        },
      ],
      rankedTypeBoosts: rangeTypes.map((t) => ({ type: t, amount: 250 })),
      targetTypeIndices: [14, 0, 1],
      typeVector: rangeTypes.map(() => 250),
    });
    expect(norm(v)).toBeLessThan(Infinity);
  });
});

describe('getTargetLevelVector', () => {
  it('Returns a nonzero vector given level 1 power and zero vector', () => {
    const targetPowers: Power[] = [
      {
        mealPower: MealPower.EXP,
        type: TypeIndex.FIGHTING,
        level: 1,
      },
    ];
    const v = getTargetLevelVector({
      targetPowers,
      targetConfigSet: [
        {
          config: 'ONE_THREE_TWO',
          typePlaceIndex: 0,
          mpPlaceIndex: 0,
        },
      ],
      targetTypes: getTypeTargetsByPlace(targetPowers, [0], []),
      typeVector: [],
    });
    expect(v[1]).toBe(1);
  });

  it('Returns a sufficiently high vector with level 3 power and zero vector', () => {
    const targetPowers: Power[] = [
      {
        mealPower: MealPower.EXP,
        type: TypeIndex.FIGHTING,
        level: 3,
      },
    ];
    const targetTypes = getTypeTargetsByPlace(targetPowers, [0], []);
    const v = getTargetLevelVector({
      targetPowers,
      targetConfigSet: [
        {
          config: 'ONE_ONE_THREE',
          typePlaceIndex: 0,
          mpPlaceIndex: 2,
        },
      ],
      targetTypes,
      typeVector: [],
    });
    expect(v[1]).toBe(380);
  });

  it('Targets the target type', () => {
    const targetPowers: Power[] = [
      {
        mealPower: MealPower.HUMUNGO,
        type: TypeIndex.DRAGON,
        level: 2,
      },
    ];
    const typeVector = rangeTypes.map(() => 0);
    typeVector[TypeIndex.NORMAL] = 146;
    typeVector[TypeIndex.POISON] = 146;
    typeVector[TypeIndex.BUG] = 144;
    typeVector[TypeIndex.FIRE] = 144;
    typeVector[TypeIndex.ELECTRIC] = 144;
    typeVector[TypeIndex.DRAGON] = 144;
    typeVector[TypeIndex.FIGHTING] = 2;
    typeVector[TypeIndex.FLYING] = 2;
    typeVector[TypeIndex.ROCK] = 2;
    typeVector[TypeIndex.GROUND] = 2;

    const rankedTypeBoosts = rankTypeBoosts(typeVector);
    const v = getTargetLevelVector({
      targetPowers,
      targetConfigSet: [
        {
          config: 'ONE_THREE_TWO',
          typePlaceIndex: 0,
          mpPlaceIndex: 0,
        },
      ],
      targetTypes: getTypeTargetsByPlace(targetPowers, [0], rankedTypeBoosts),
      typeVector,
    });

    expect(v[15]).toBe(180);
    expect(v[0]).toBe(146);
  });

  it('Takes Sparkling power into consideration', () => {
    const v = getTargetLevelVector({
      targetPowers: [
        { mealPower: MealPower.EXP, type: TypeIndex.ICE, level: 3 },
      ],
      targetConfigSet: [
        {
          config: 'ONE_ONE_THREE',
          typePlaceIndex: 0,
          mpPlaceIndex: 2,
        },
      ],
      targetTypes: [14, 0, 1],
      typeVector: [
        250, 250, 250, 250, 250, 250, 250, 250, 250, 250, 250, 250, 250, 250,
        250, 250, 250, 250,
      ],
    });

    expect(v[0]).toBe(250);
  });
});