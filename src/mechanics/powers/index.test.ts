import { allTypes } from '../../strings';
import {
  calculateTypes,
  evaluateBoosts,
  powersMatch,
  rankMealPowerBoosts,
} from './index';

describe('rankMealPowerBoosts', () => {
  it('Considers an unboosted meal power when applying flavor boost', () => {
    const ranked = rankMealPowerBoosts(
      { Exp: 60, Item: 18, Encounter: 24, Egg: 4 },
      'Catch',
    );
    expect(ranked[0].name).toBe('Catch');
  });

  it('Puts Exp=(100+84) over Encounter=102', () => {
    const ranked = rankMealPowerBoosts(
      {
        Encounter: 102,
        Exp: 84,
        Catch: 24,
        Teensy: 21,
      },
      'Exp',
    );

    expect(ranked[0].name).toBe('Exp');
    expect(ranked[1].name).toBe('Encounter');
  });
});

describe('powersMatch', () => {
  it('Handles typeless powers', () => {
    const match = powersMatch(
      {
        mealPower: 'Egg',
        type: 'Fighting',
        level: 2,
      },
      {
        mealPower: 'Egg',
        type: 'Bug',
        level: 2,
      },
    );

    expect(match).toBe(true);
  });
});

describe('calculateTypes', () => {
  it('Does not output holes', () => {
    const types = calculateTypes([
      { name: 'Steel', amount: 2, typeIndex: allTypes.indexOf('Steel') },
      { name: 'Fire', amount: 2, typeIndex: allTypes.indexOf('Fire') },
    ]);
    expect(types[1]).toBeDefined();
  });
});

describe('evaluateBoosts', () => {
  it('Decides Exp Ghost to be the top power for a herbed sausage and red onion sandwich', () => {
    const boosts = evaluateBoosts(
      {
        Encounter: 102,
        Exp: 84,
        Catch: 24,
        Teensy: 21,
      },
      'Exp',
      {
        Ghost: 182,
        Water: 146,
      },
    );

    expect(boosts[0].mealPower).toBe('Exp');
    expect(boosts[0].type).toBe('Ghost');
  });
});
