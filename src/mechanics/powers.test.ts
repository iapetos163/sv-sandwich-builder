import {
  calculateTypes,
  getTargetLevelVector,
  getTargetTypeVector,
  powersMatch,
  rankMealPowerBoosts,
} from './powers';

describe('getTargetTypeVector', () => {
  it('Creates a vector with the correct components for Ground', () => {
    const v = getTargetTypeVector(
      { mealPower: 'Exp', type: 'Ground', level: 1 },
      [],
    );
    expect(v[4]).toBeGreaterThan(0);
  });
});

describe('getTargetLevelVector', () => {
  it('Returns a nonzero vector given level 1 power and zero vector', () => {
    const v = getTargetLevelVector(
      { mealPower: 'Exp', type: 'Fighting', level: 1 },
      [],
    );
    expect(v[1]).toBe(1);
  });

  it('Returns a sufficiently high vector with level 3 power and zero vector', () => {
    const v = getTargetLevelVector(
      { mealPower: 'Exp', type: 'Fighting', level: 3 },
      [],
    );
    expect(v[1]).toBe(380);
  });

  it('Targets the target type', () => {
    const v = getTargetLevelVector(
      { mealPower: 'Humungo', type: 'Dragon', level: 2 },
      [146, 2, 2, 146, 2, 2, 144, 0, 0, 144, 0, 0, 144, 0, 0, 144, 0, 0],
    );

    expect(v[15]).toBe(180);
    expect(v[0]).toBe(146);
  });
});

describe('rankMealPowerBoosts', () => {
  it('Considers an unboosted meal power when applying flavor boost', () => {
    const ranked = rankMealPowerBoosts(
      { Exp: 60, Item: 18, Encounter: 24, Egg: 4 },
      'Catch',
    );
    expect(ranked[0].name).toBe('Catch');
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
    const levels = calculateTypes([
      { name: 'Steel', amount: 2 },
      { name: 'Fire', amount: 2 },
    ]);
    expect(levels[1]).toBeDefined();
  });
});
