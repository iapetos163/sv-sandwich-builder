import { MealPower, rangeMealPowers, rangeTypes, TypeIndex } from '../../enum';
import {
  calculateTypes,
  evaluateBoosts,
  powersMatch,
  rankMealPowerBoosts,
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
