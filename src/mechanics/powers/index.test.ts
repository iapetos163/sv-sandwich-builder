import { MealPower, rangeMealPowers, rangeTypes, TypeIndex } from '../../enum';
import {
  calculateTypes,
  evaluateBoosts,
  getTargetConfigs,
  getTypeTargetsByPlace,
  powersMatch,
  rankMealPowerBoosts,
  rankTypeBoosts,
  requestedPowersValid,
} from './index';

describe('rankMealPowerBoosts', () => {
  it('Considers an unboosted meal power when applying flavor boost', () => {
    const mealPowerVector = rangeMealPowers.map(() => 0);

    mealPowerVector[MealPower.EXP] = 60;
    mealPowerVector[MealPower.ITEM] = 18;
    mealPowerVector[MealPower.ENCOUNTER] = 24;
    mealPowerVector[MealPower.EGG] = 4;

    const ranked = rankMealPowerBoosts(mealPowerVector, MealPower.CATCH);
    expect(ranked[0].mealPower).toBe(MealPower.CATCH);
  });

  it('Puts Exp=(100+84) over Encounter=102', () => {
    const mealPowerVector = rangeMealPowers.map(() => 0);

    mealPowerVector[MealPower.EXP] = 84;
    mealPowerVector[MealPower.CATCH] = 24;
    mealPowerVector[MealPower.ENCOUNTER] = 102;
    mealPowerVector[MealPower.TEENSY] = 21;
    const ranked = rankMealPowerBoosts(mealPowerVector, MealPower.EXP);

    expect(ranked[0].mealPower).toBe(MealPower.EXP);
    expect(ranked[1].mealPower).toBe(MealPower.ENCOUNTER);
  });
});

describe('powersMatch', () => {
  it('Handles typeless powers', () => {
    const match = powersMatch(
      {
        mealPower: MealPower.EGG,
        type: TypeIndex.FIGHTING,
        level: 2,
      },
      {
        mealPower: MealPower.EGG,
        type: TypeIndex.BUG,
        level: 2,
      },
    );

    expect(match).toBe(true);
  });
});

describe('calculateTypes', () => {
  it('Does not output holes', () => {
    const types = calculateTypes([
      { amount: 2, type: TypeIndex.STEEL },
      { amount: 2, type: TypeIndex.FIRE },
    ]);
    expect(types[1]).toBeDefined();
  });
});

describe('evaluateBoosts', () => {
  it('Decides Exp Ghost to be the top power for a herbed sausage and red onion sandwich', () => {
    const mealPowerVector = rangeMealPowers.map(() => 0);
    mealPowerVector[MealPower.EXP] = 84;
    mealPowerVector[MealPower.CATCH] = 24;
    mealPowerVector[MealPower.ENCOUNTER] = 102;
    mealPowerVector[MealPower.TEENSY] = 21;

    const typeVector = rangeTypes.map(() => 0);
    typeVector[TypeIndex.GHOST] = 182;
    typeVector[TypeIndex.WATER] = 146;

    const boosts = evaluateBoosts(mealPowerVector, MealPower.EXP, typeVector);

    expect(boosts[0].mealPower).toBe(MealPower.EXP);
    expect(boosts[0].type).toBe(TypeIndex.GHOST);
  });
});

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

describe('requestedPowersValid', () => {
  it('Returns true for Lv 1 Exp Dragon, Lv 1 Item Fighting, and Lv 1 Encounter Electric', () => {
    const res = requestedPowersValid([
      {
        mealPower: MealPower.EXP,
        type: TypeIndex.DRAGON,
        level: 1,
      },
      {
        mealPower: MealPower.ITEM,
        type: TypeIndex.FIGHTING,
        level: 1,
      },
      {
        mealPower: MealPower.ENCOUNTER,
        type: TypeIndex.ELECTRIC,
        level: 1,
      },
    ]);
    expect(res).toBe(true);
  });

  it('Returns true for Lv 3 Sparkling Ice and Lv 3 Exp Ice', () => {
    const res = requestedPowersValid([
      {
        mealPower: MealPower.SPARKLING,
        type: TypeIndex.ICE,
        level: 3,
      },
      {
        mealPower: MealPower.EXP,
        type: TypeIndex.ICE,
        level: 3,
      },
    ]);

    expect(res).toBe(true);
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
