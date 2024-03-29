import { MealPower, rangeMealPowers, rangeTypes, TypeIndex } from '../enum';
import {
  calculateTypes,
  evaluateBoosts,
  powersMatch,
  rankMealPowerBoosts,
  requestedPowersValid,
} from './powers';

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

  it('returns 3 powers', () => {
    const res = evaluateBoosts(
      [-3, 48, 12, 0, 9, 0, 0, 0, 0, 84],
      MealPower.CATCH,
      [0, 0, 0, 0, 0, 0, 74, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    );

    expect(res).toHaveLength(3);
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

  it('Returns false for Lv 3 Title Bug, Lv 3 Encounter Bug, and Lv 3 Humungo Bug in single player', () => {
    const res = requestedPowersValid([
      {
        mealPower: MealPower.TITLE,
        type: TypeIndex.BUG,
        level: 3,
      },
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
    ]);

    expect(res).toBe(false);
  });

  it('Returns true for Lv 3 Title Bug, Lv 3 Encounter Bug, and Lv 3 Humungo Bug in multiplayer', () => {
    const res = requestedPowersValid(
      [
        {
          mealPower: MealPower.TITLE,
          type: TypeIndex.BUG,
          level: 3,
        },
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
      ],
      true,
    );

    expect(res).toBe(true);
  });
});
