import { allTypes } from '../strings';
import {
  calculateTypes,
  evaluateBoosts,
  getTargetLevelVector,
  getTargetTypeVector,
  powersMatch,
  rankMealPowerBoosts,
} from './powers';

describe('getTargetTypeVector', () => {
  it('Creates a vector with the correct components for Ground', () => {
    const v = getTargetTypeVector(
      { mealPower: 'Exp', type: 'Ground', level: 1 },
      { config: 'ONE_THREE_TWO', mpPlaceIndex: 0, typePlaceIndex: 0 },
      [],
      [],
    );
    expect(v[4]).toBeGreaterThan(0);
    expect(v[0]).toBe(0);
  });

  it('Handles a zero vector and typePlaceIndex > 0', () => {
    const v = getTargetTypeVector(
      { mealPower: 'Exp', type: 'Ghost', level: 3 },
      { config: 'ONE_THREE_TWO', typePlaceIndex: 2, mpPlaceIndex: 2 },
      [],
      [],
    );
    expect(v[0]).toBe(2);
    expect(v[1]).toBe(2);
    expect(v[2]).toBe(0);
    expect(v[7]).toBe(1);
  });

  it('Handles a placing below desired rank (>0) in a tie', () => {
    const v = getTargetTypeVector(
      { mealPower: 'Exp', type: 'Grass', level: 3 },
      { config: 'ONE_THREE_TWO', typePlaceIndex: 2, mpPlaceIndex: 2 },
      [
        { name: 'Flying', typeIndex: 2, amount: 36 },
        { name: 'Rock', typeIndex: 5, amount: 36 },
        { name: 'Steel', typeIndex: 8, amount: 36 },
        { name: 'Grass', typeIndex: 11, amount: 36 },
        { name: 'Ice', typeIndex: 14, amount: 36 },
        { name: 'Fairy', typeIndex: 17, amount: 36 },
      ],
      [0, 0, 36, 0, 0, 36, 0, 0, 36, 0, 0, 36, 0, 0, 36, 0, 0, 36],
    );
    expect(v[2]).toBe(38);
    expect(v[5]).toBe(38);
    expect(v[8]).toBe(36);
    expect(v[11]).toBe(37);
    expect(v[14]).toBe(36);
    expect(v[17]).toBe(36);
  });

  it('Handles a placing below desired rank 0 in a tie', () => {
    const v = getTargetTypeVector(
      { mealPower: 'Exp', type: 'Grass', level: 1 },
      { config: 'ONE_THREE_TWO', typePlaceIndex: 0, mpPlaceIndex: 0 },
      [
        { name: 'Flying', typeIndex: 2, amount: 36 },
        { name: 'Rock', typeIndex: 5, amount: 36 },
        { name: 'Steel', typeIndex: 8, amount: 36 },
        { name: 'Grass', typeIndex: 11, amount: 36 },
        { name: 'Ice', typeIndex: 14, amount: 36 },
        { name: 'Fairy', typeIndex: 17, amount: 36 },
      ],
      [0, 0, 36, 0, 0, 36, 0, 0, 36, 0, 0, 36, 0, 0, 36, 0, 0, 36],
    );
    expect(v[2]).toBe(36);
    expect(v[5]).toBe(36);
    expect(v[8]).toBe(36);
    expect(v[11]).toBe(37);
    expect(v[14]).toBe(36);
    expect(v[17]).toBe(36);
  });

  it('Handles a placing above desired rank (>0) in a tie', () => {
    const v = getTargetTypeVector(
      { mealPower: 'Exp', type: 'Flying', level: 3 },
      { config: 'ONE_THREE_TWO', typePlaceIndex: 2, mpPlaceIndex: 2 },
      [
        { name: 'Flying', typeIndex: 2, amount: 36 },
        { name: 'Rock', typeIndex: 5, amount: 36 },
        { name: 'Steel', typeIndex: 8, amount: 36 },
        { name: 'Grass', typeIndex: 11, amount: 36 },
        { name: 'Ice', typeIndex: 14, amount: 36 },
        { name: 'Fairy', typeIndex: 17, amount: 36 },
      ],
      [0, 0, 36, 0, 0, 36, 0, 0, 36, 0, 0, 36, 0, 0, 36, 0, 0, 36],
    );
    expect(v[2]).toBe(36);
    expect(v[5]).toBe(37);
    expect(v[8]).toBe(37);
    expect(v[11]).toBe(36);
    expect(v[14]).toBe(36);
    expect(v[17]).toBe(36);
  });

  it('Handles a placing above desired rank (>0) in a tie with another ahead', () => {
    const v = getTargetTypeVector(
      { mealPower: 'Exp', type: 'Flying', level: 3 },
      { config: 'ONE_THREE_TWO', typePlaceIndex: 2, mpPlaceIndex: 2 },
      [
        { name: 'Normal', typeIndex: 0, amount: 40 },
        { name: 'Flying', typeIndex: 2, amount: 36 },
        { name: 'Rock', typeIndex: 5, amount: 36 },
        { name: 'Steel', typeIndex: 8, amount: 36 },
        { name: 'Grass', typeIndex: 11, amount: 36 },
        { name: 'Ice', typeIndex: 14, amount: 36 },
        { name: 'Fairy', typeIndex: 17, amount: 36 },
      ],
      [40, 0, 36, 0, 0, 36, 0, 0, 36, 0, 0, 36, 0, 0, 36, 0, 0, 36],
    );
    expect(v[0]).toBe(40);
    expect(v[2]).toBe(36);
    expect(v[5]).toBe(37);
    expect(v[8]).toBe(36);
    expect(v[11]).toBe(36);
    expect(v[14]).toBe(36);
    expect(v[17]).toBe(36);
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
