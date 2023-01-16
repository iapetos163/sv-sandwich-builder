import { Power } from '../../types';
import { norm } from '../../vector-math';
import {
  getTargetLevelVector,
  getTargetMealPowerVector,
  getTargetTypeVector,
} from './vector';
import { getTypeTargetIndices, rankTypeBoosts, TypeBoost } from './index';

describe('getTargetTypeVector', () => {
  it('Creates a vector with the correct components for Ground', () => {
    const targetPower: Power = { mealPower: 'Exp', type: 'Ground', level: 1 };
    const rankedTypeBoosts: TypeBoost[] = [];
    const v = getTargetTypeVector({
      targetPower,
      targetConfig: {
        config: 'ONE_THREE_TWO',
        mpPlaceIndex: 0,
        typePlaceIndex: 0,
      },
      targetTypeIndices: getTypeTargetIndices(targetPower, 0, rankedTypeBoosts),
      rankedTypeBoosts,
      typeVector: [],
    });
    expect(v[4]).toBeGreaterThan(0);
    expect(v[0]).toBe(0);
  });

  it('Handles a zero vector and typePlaceIndex > 0', () => {
    const targetPower: Power = { mealPower: 'Exp', type: 'Ghost', level: 3 };
    const rankedTypeBoosts: TypeBoost[] = [];
    const v = getTargetTypeVector({
      targetPower,
      targetConfig: {
        config: 'ONE_THREE_TWO',
        typePlaceIndex: 2,
        mpPlaceIndex: 2,
      },
      targetTypeIndices: getTypeTargetIndices(targetPower, 2, rankedTypeBoosts),
      rankedTypeBoosts,
      typeVector: [],
    });
    expect(v[0]).toBe(2);
    expect(v[1]).toBe(2);
    expect(v[2]).toBe(0);
    expect(v[7]).toBe(1);
  });

  it('Handles a placing below desired rank (>0) in a tie', () => {
    const targetPower: Power = { mealPower: 'Exp', type: 'Grass', level: 3 };
    const rankedTypeBoosts: TypeBoost[] = [
      { name: 'Flying', typeIndex: 2, amount: 36 },
      { name: 'Rock', typeIndex: 5, amount: 36 },
      { name: 'Steel', typeIndex: 8, amount: 36 },
      { name: 'Grass', typeIndex: 11, amount: 36 },
      { name: 'Ice', typeIndex: 14, amount: 36 },
      { name: 'Fairy', typeIndex: 17, amount: 36 },
    ];
    const v = getTargetTypeVector({
      targetPower,
      targetConfig: {
        config: 'ONE_THREE_TWO',
        typePlaceIndex: 2,
        mpPlaceIndex: 2,
      },
      targetTypeIndices: getTypeTargetIndices(targetPower, 2, rankedTypeBoosts),
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
    const targetPower: Power = { mealPower: 'Exp', type: 'Grass', level: 1 };
    const rankedTypeBoosts: TypeBoost[] = [
      { name: 'Flying', typeIndex: 2, amount: 36 },
      { name: 'Rock', typeIndex: 5, amount: 36 },
      { name: 'Steel', typeIndex: 8, amount: 36 },
      { name: 'Grass', typeIndex: 11, amount: 36 },
      { name: 'Ice', typeIndex: 14, amount: 36 },
      { name: 'Fairy', typeIndex: 17, amount: 36 },
    ];
    const v = getTargetTypeVector({
      targetPower,
      targetConfig: {
        config: 'ONE_THREE_TWO',
        typePlaceIndex: 0,
        mpPlaceIndex: 0,
      },
      targetTypeIndices: getTypeTargetIndices(targetPower, 0, rankedTypeBoosts),
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
    const targetPower: Power = { mealPower: 'Exp', type: 'Flying', level: 3 };
    const rankedTypeBoosts: TypeBoost[] = [
      { name: 'Flying', typeIndex: 2, amount: 36 },
      { name: 'Rock', typeIndex: 5, amount: 36 },
      { name: 'Steel', typeIndex: 8, amount: 36 },
      { name: 'Grass', typeIndex: 11, amount: 36 },
      { name: 'Ice', typeIndex: 14, amount: 36 },
      { name: 'Fairy', typeIndex: 17, amount: 36 },
    ];
    const v = getTargetTypeVector({
      targetPower,
      targetConfig: {
        config: 'ONE_THREE_TWO',
        typePlaceIndex: 2,
        mpPlaceIndex: 2,
      },
      targetTypeIndices: getTypeTargetIndices(targetPower, 2, rankedTypeBoosts),
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
    const targetPower: Power = { mealPower: 'Exp', type: 'Flying', level: 3 };
    const rankedTypeBoosts: TypeBoost[] = [
      { name: 'Normal', typeIndex: 0, amount: 40 },
      { name: 'Flying', typeIndex: 2, amount: 36 },
      { name: 'Rock', typeIndex: 5, amount: 36 },
      { name: 'Steel', typeIndex: 8, amount: 36 },
      { name: 'Grass', typeIndex: 11, amount: 36 },
      { name: 'Ice', typeIndex: 14, amount: 36 },
      { name: 'Fairy', typeIndex: 17, amount: 36 },
    ];
    const v = getTargetTypeVector({
      targetPower,
      targetConfig: {
        config: 'ONE_THREE_TWO',
        typePlaceIndex: 2,
        mpPlaceIndex: 2,
      },
      targetTypeIndices: getTypeTargetIndices(targetPower, 2, rankedTypeBoosts),
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
      targetPower: { mealPower: 'Exp', type: 'Ice', level: 3 },
      targetConfig: {
        config: 'ONE_ONE_THREE',
        typePlaceIndex: 0,
        mpPlaceIndex: 2,
      },
      rankedTypeBoosts: [],
      targetTypeIndices: [14, 0, 1],
      typeVector: [],
    });
    expect(norm(v)).toBeLessThan(Infinity);
  });

  it('Does not return infinity when targeting ONE_ONE_THREE and having added one herba mystica', () => {
    const v = getTargetTypeVector({
      targetPower: { mealPower: 'Exp', type: 'Ice', level: 3 },
      targetConfig: {
        config: 'ONE_ONE_THREE',
        typePlaceIndex: 0,
        mpPlaceIndex: 2,
      },
      rankedTypeBoosts: [
        { name: 'Normal', amount: 250, typeIndex: 0 },
        { name: 'Fighting', amount: 250, typeIndex: 1 },
        { name: 'Flying', amount: 250, typeIndex: 2 },
        { name: 'Poison', amount: 250, typeIndex: 3 },
        { name: 'Ground', amount: 250, typeIndex: 4 },
        { name: 'Rock', amount: 250, typeIndex: 5 },
        { name: 'Bug', amount: 250, typeIndex: 6 },
        { name: 'Ghost', amount: 250, typeIndex: 7 },
        { name: 'Steel', amount: 250, typeIndex: 8 },
        { name: 'Fire', amount: 250, typeIndex: 9 },
        { name: 'Water', amount: 250, typeIndex: 10 },
        { name: 'Grass', amount: 250, typeIndex: 11 },
        { name: 'Electric', amount: 250, typeIndex: 12 },
        { name: 'Psychic', amount: 250, typeIndex: 13 },
        { name: 'Ice', amount: 250, typeIndex: 14 },
        { name: 'Dragon', amount: 250, typeIndex: 15 },
        { name: 'Dark', amount: 250, typeIndex: 16 },
        { name: 'Fairy', amount: 250, typeIndex: 17 },
      ],
      targetTypeIndices: [14, 0, 1],
      typeVector: [
        250, 250, 250, 250, 250, 250, 250, 250, 250, 250, 250, 250, 250, 250,
        250, 250, 250, 250,
      ],
    });
    expect(norm(v)).toBeLessThan(Infinity);
  });
});

describe('getTargetLevelVector', () => {
  it('Returns a nonzero vector given level 1 power and zero vector', () => {
    const targetPower: Power = { mealPower: 'Exp', type: 'Fighting', level: 1 };
    const v = getTargetLevelVector({
      targetPower,
      targetConfig: {
        config: 'ONE_THREE_TWO',
        typePlaceIndex: 0,
        mpPlaceIndex: 0,
      },
      targetTypeIndices: getTypeTargetIndices(targetPower, 0, []),
      typeVector: [],
    });
    expect(v[1]).toBe(1);
  });

  it('Returns a sufficiently high vector with level 3 power and zero vector', () => {
    const targetPower: Power = { mealPower: 'Exp', type: 'Fighting', level: 3 };
    const targetTypeIndices = getTypeTargetIndices(targetPower, 0, []);
    const v = getTargetLevelVector({
      targetPower,
      targetConfig: {
        config: 'ONE_ONE_THREE',
        typePlaceIndex: 0,
        mpPlaceIndex: 2,
      },
      targetTypeIndices,
      typeVector: [],
    });
    expect(v[1]).toBe(380);
  });

  it('Targets the target type', () => {
    const targetPower: Power = {
      mealPower: 'Humungo',
      type: 'Dragon',
      level: 2,
    };
    const rankedTypeBoosts = rankTypeBoosts({
      Normal: 146,
      Fighting: 2,
      Flying: 2,
      Poison: 146,
      Ground: 2,
      Rock: 2,
      Bug: 144,
      Fire: 144,
      Electric: 144,
      Dragon: 144,
    });
    const v = getTargetLevelVector({
      targetPower,
      targetConfig: {
        config: 'ONE_THREE_TWO',
        typePlaceIndex: 0,
        mpPlaceIndex: 0,
      },
      targetTypeIndices: getTypeTargetIndices(targetPower, 0, rankedTypeBoosts),
      typeVector: [
        146, 2, 2, 146, 2, 2, 144, 0, 0, 144, 0, 0, 144, 0, 0, 144, 0, 0,
      ],
    });

    expect(v[15]).toBe(180);
    expect(v[0]).toBe(146);
  });

  it('Takes Sparkling power into consideration', () => {
    const v = getTargetLevelVector({
      targetPower: { mealPower: 'Exp', type: 'Ice', level: 3 },
      targetConfig: {
        config: 'ONE_ONE_THREE',
        typePlaceIndex: 0,
        mpPlaceIndex: 2,
      },
      targetTypeIndices: [14, 0, 1],
      typeVector: [
        250, 250, 250, 250, 250, 250, 250, 250, 250, 250, 250, 250, 250, 250,
        250, 250, 250, 250,
      ],
    });

    expect(v[0]).toBe(250);
  });
});

describe('getTargetMealPowerVector', () => {
  it('Does not output zero when given a zero vector', () => {
    const v = getTargetMealPowerVector({
      targetPower: { mealPower: 'Teensy', type: 'Steel', level: 3 },
      targetConfig: {
        config: 'ONE_ONE_THREE',
        typePlaceIndex: 0,
        mpPlaceIndex: 2,
      },
      rankedMealPowerBoosts: [],
      mealPowerVector: [],
    });
    expect(v[8]).toBeGreaterThan(0);
  });
  it('Does not attempt to force positioning', () => {
    const v = getTargetMealPowerVector({
      targetPower: { mealPower: 'Teensy', type: 'Steel', level: 3 },
      targetConfig: {
        config: 'ONE_ONE_THREE',
        typePlaceIndex: 0,
        mpPlaceIndex: 2,
      },
      rankedMealPowerBoosts: [],
      mealPowerVector: [],
    });
    expect(v[0]).toBe(0);
  });
  it('Does not output zero when given Egg power and zero', () => {
    const v = getTargetMealPowerVector({
      targetPower: { mealPower: 'Egg', type: 'Steel', level: 3 },
      targetConfig: {
        config: 'ONE_ONE_THREE',
        typePlaceIndex: 0,
        mpPlaceIndex: 2,
      },
      rankedMealPowerBoosts: [],
      mealPowerVector: [],
    });
    expect(v[0]).toBeGreaterThan(0);
  });
});