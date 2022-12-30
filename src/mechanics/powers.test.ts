import {
  getTargetLevelVector,
  getTargetTypeVector,
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
