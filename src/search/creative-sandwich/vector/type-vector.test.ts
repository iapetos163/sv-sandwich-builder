import { MealPower, rangeTypes, TypeIndex } from '../../../enum';
import { rankTypeBoosts, TypeBoost } from '../../../mechanics';
import { Power } from '../../../types';
import { norm } from '../../../vector-math';
import { getTypeTargetsByPlace } from '../target/target-config';
import { getTargetTypeVector } from './type-vector';

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
          typeAllocation: 'ONE_THREE_TWO',
          mpPlaceIndex: 0,
          typePlaceIndex: 0,
        },
      ],
      targetTypes: getTypeTargetsByPlace(targetPowers, [0], rankedTypeBoosts),
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
          typeAllocation: 'ONE_THREE_TWO',
          typePlaceIndex: 2,
          mpPlaceIndex: 2,
        },
      ],
      targetTypes: getTypeTargetsByPlace(targetPowers, [2], rankedTypeBoosts),
      rankedTypeBoosts,
      typeVector: [],
    });
    expect(v[0]).toBeGreaterThanOrEqual(2);
    expect(v[1]).toBeGreaterThanOrEqual(2);
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
          typeAllocation: 'ONE_THREE_TWO',
          typePlaceIndex: 2,
          mpPlaceIndex: 2,
        },
      ],
      targetTypes: getTypeTargetsByPlace(targetPowers, [2], rankedTypeBoosts),
      rankedTypeBoosts,
      typeVector: [0, 0, 36, 0, 0, 36, 0, 0, 36, 0, 0, 36, 0, 0, 36, 0, 0, 36],
    });
    expect(v[2]).toBeGreaterThanOrEqual(38);
    expect(v[5]).toBeGreaterThanOrEqual(38);
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
          typeAllocation: 'ONE_THREE_TWO',
          typePlaceIndex: 0,
          mpPlaceIndex: 0,
        },
      ],
      targetTypes: getTypeTargetsByPlace(targetPowers, [0], rankedTypeBoosts),
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
          typeAllocation: 'ONE_THREE_TWO',
          typePlaceIndex: 2,
          mpPlaceIndex: 2,
        },
      ],
      targetTypes: getTypeTargetsByPlace(targetPowers, [2], rankedTypeBoosts),
      rankedTypeBoosts,
      typeVector: [0, 0, 36, 0, 0, 36, 0, 0, 36, 0, 0, 36, 0, 0, 36, 0, 0, 36],
    });
    expect(v[2]).toBe(36);
    expect(v[5]).toBeGreaterThanOrEqual(37);
    expect(v[8]).toBeGreaterThanOrEqual(37);
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
          typeAllocation: 'ONE_THREE_TWO',
          typePlaceIndex: 2,
          mpPlaceIndex: 2,
        },
      ],
      targetTypes: getTypeTargetsByPlace(targetPowers, [2], rankedTypeBoosts),
      rankedTypeBoosts,
      typeVector: [40, 0, 36, 0, 0, 36, 0, 0, 36, 0, 0, 36, 0, 0, 36, 0, 0, 36],
    });
    expect(v[0]).toBeGreaterThanOrEqual(40);
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
          typeAllocation: 'ONE_ONE_THREE',
          typePlaceIndex: 0,
          mpPlaceIndex: 2,
        },
      ],
      rankedTypeBoosts: [],
      targetTypes: [14, 0, 1],
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
          typeAllocation: 'ONE_ONE_THREE',
          typePlaceIndex: 0,
          mpPlaceIndex: 2,
        },
      ],
      rankedTypeBoosts: rangeTypes.map((t) => ({ type: t, amount: 250 })),
      targetTypes: [TypeIndex.ICE, 0, 1],
      typeVector: rangeTypes.map(() => 250),
    });
    expect(norm(v)).toBeLessThan(Infinity);
  });

  it('Does not return infinity when targeting ONE_ONE_THREE and having added one herba mystica and another ingredient', () => {
    const typeVector = [
      250, 250, 286, 250, 250, 286, 250, 250, 286, 250, 250, 286, 250, 250, 286,
      250, 250, 286,
    ];
    const v = getTargetTypeVector({
      typeVector,
      targetConfigSet: [
        {
          typeAllocation: 'ONE_ONE_THREE',
          typePlaceIndex: 0,
          mpPlaceIndex: 2,
        },
      ],
      targetPowers: [
        {
          mealPower: MealPower.EXP,
          type: TypeIndex.ICE,
          level: 3,
        },
      ],
      targetTypes: [TypeIndex.ICE, 0, 1],
      rankedTypeBoosts: rankTypeBoosts(typeVector),
    });
    expect(norm(v)).toBeLessThan(Infinity);
  });

  it('Returns a nonzero vector given level 1 power and zero vector', () => {
    const targetPowers: Power[] = [
      {
        mealPower: MealPower.EXP,
        type: TypeIndex.FIGHTING,
        level: 1,
      },
    ];
    const v = getTargetTypeVector({
      targetPowers,
      targetConfigSet: [
        {
          typeAllocation: 'ONE_THREE_TWO',
          typePlaceIndex: 0,
          mpPlaceIndex: 0,
        },
      ],
      rankedTypeBoosts: [],
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
    const v = getTargetTypeVector({
      targetPowers,
      targetConfigSet: [
        {
          typeAllocation: 'ONE_ONE_THREE',
          typePlaceIndex: 0,
          mpPlaceIndex: 2,
        },
      ],
      targetTypes,
      rankedTypeBoosts: [],
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
    const v = getTargetTypeVector({
      targetPowers,
      targetConfigSet: [
        {
          typeAllocation: 'ONE_THREE_TWO',
          typePlaceIndex: 0,
          mpPlaceIndex: 0,
        },
      ],
      targetTypes: getTypeTargetsByPlace(targetPowers, [0], rankedTypeBoosts),
      typeVector,
      rankedTypeBoosts,
    });

    expect(v[15]).toBe(180);
    expect(v[0]).toBe(146);
  });

  it('Respects requirements for ONE_THREE_ONE', () => {
    const v = getTargetTypeVector({
      targetPowers: [
        { mealPower: 2, type: TypeIndex.ROCK, level: 1 },
        { mealPower: 1, type: TypeIndex.ROCK, level: 1 },
      ],
      targetConfigSet: [
        {
          typeAllocation: 'ONE_THREE_ONE',
          typePlaceIndex: 0,
          mpPlaceIndex: 0,
        },
        {
          typeAllocation: 'ONE_THREE_ONE',
          typePlaceIndex: 0,
          mpPlaceIndex: 2,
        },
      ],
      rankedTypeBoosts: [],
      targetTypes: [TypeIndex.ROCK, 0, 1],
      typeVector: [],
    });

    expect(v[TypeIndex.ROCK]).toBeGreaterThanOrEqual(74);
  });

  it('Returns a vector with norm Infinity if the target allocation is not achievable', () => {
    const typeVector = [
      0, 0, 36, 0, 0, 36, 0, 0, 36, 0, 0, 36, 0, 0, 36, 0, 0, 36,
    ];
    const rankedTypeBoosts = rankTypeBoosts(typeVector);

    const v = getTargetTypeVector({
      targetPowers: [
        { mealPower: 2, type: TypeIndex.ROCK, level: 1 },
        { mealPower: 1, type: TypeIndex.ROCK, level: 1 },
      ],
      targetTypes: [TypeIndex.ROCK, 0, 1],
      targetConfigSet: [
        {
          typeAllocation: 'ONE_THREE_ONE',
          typePlaceIndex: 0,
          mpPlaceIndex: 0,
        },
        {
          typeAllocation: 'ONE_THREE_ONE',
          typePlaceIndex: 0,
          mpPlaceIndex: 2,
        },
      ],
      typeVector,
      rankedTypeBoosts,
    });

    expect(norm(v)).toBe(Infinity);
  });
});
