import { allTypes } from '../../strings';
import { getTargetLevelVector, getTargetTypeVector } from './vector';

describe('getTargetTypeVector', () => {
  it('Creates a vector with the correct components for Ground', () => {
    const v = getTargetTypeVector({
      targetPower: { mealPower: 'Exp', type: 'Ground', level: 1 },
      targetConfig: {
        config: 'ONE_THREE_TWO',
        mpPlaceIndex: 0,
        typePlaceIndex: 0,
      },
      rankedTypeBoosts: [],
      typeVector: [],
    });
    expect(v[4]).toBeGreaterThan(0);
    expect(v[0]).toBe(0);
  });

  it('Handles a zero vector and typePlaceIndex > 0', () => {
    const v = getTargetTypeVector({
      targetPower: { mealPower: 'Exp', type: 'Ghost', level: 3 },
      targetConfig: {
        config: 'ONE_THREE_TWO',
        typePlaceIndex: 2,
        mpPlaceIndex: 2,
      },
      rankedTypeBoosts: [],
      typeVector: [],
    });
    expect(v[0]).toBe(2);
    expect(v[1]).toBe(2);
    expect(v[2]).toBe(0);
    expect(v[7]).toBe(1);
  });

  it('Handles a placing below desired rank (>0) in a tie', () => {
    const v = getTargetTypeVector({
      targetPower: { mealPower: 'Exp', type: 'Grass', level: 3 },
      targetConfig: {
        config: 'ONE_THREE_TWO',
        typePlaceIndex: 2,
        mpPlaceIndex: 2,
      },
      rankedTypeBoosts: [
        { name: 'Flying', typeIndex: 2, amount: 36 },
        { name: 'Rock', typeIndex: 5, amount: 36 },
        { name: 'Steel', typeIndex: 8, amount: 36 },
        { name: 'Grass', typeIndex: 11, amount: 36 },
        { name: 'Ice', typeIndex: 14, amount: 36 },
        { name: 'Fairy', typeIndex: 17, amount: 36 },
      ],
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
    const v = getTargetTypeVector({
      targetPower: { mealPower: 'Exp', type: 'Grass', level: 1 },
      targetConfig: {
        config: 'ONE_THREE_TWO',
        typePlaceIndex: 0,
        mpPlaceIndex: 0,
      },
      rankedTypeBoosts: [
        { name: 'Flying', typeIndex: 2, amount: 36 },
        { name: 'Rock', typeIndex: 5, amount: 36 },
        { name: 'Steel', typeIndex: 8, amount: 36 },
        { name: 'Grass', typeIndex: 11, amount: 36 },
        { name: 'Ice', typeIndex: 14, amount: 36 },
        { name: 'Fairy', typeIndex: 17, amount: 36 },
      ],
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
    const v = getTargetTypeVector({
      targetPower: { mealPower: 'Exp', type: 'Flying', level: 3 },
      targetConfig: {
        config: 'ONE_THREE_TWO',
        typePlaceIndex: 2,
        mpPlaceIndex: 2,
      },
      rankedTypeBoosts: [
        { name: 'Flying', typeIndex: 2, amount: 36 },
        { name: 'Rock', typeIndex: 5, amount: 36 },
        { name: 'Steel', typeIndex: 8, amount: 36 },
        { name: 'Grass', typeIndex: 11, amount: 36 },
        { name: 'Ice', typeIndex: 14, amount: 36 },
        { name: 'Fairy', typeIndex: 17, amount: 36 },
      ],
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
    const v = getTargetTypeVector({
      targetPower: { mealPower: 'Exp', type: 'Flying', level: 3 },
      targetConfig: {
        config: 'ONE_THREE_TWO',
        typePlaceIndex: 2,
        mpPlaceIndex: 2,
      },
      rankedTypeBoosts: [
        { name: 'Normal', typeIndex: 0, amount: 40 },
        { name: 'Flying', typeIndex: 2, amount: 36 },
        { name: 'Rock', typeIndex: 5, amount: 36 },
        { name: 'Steel', typeIndex: 8, amount: 36 },
        { name: 'Grass', typeIndex: 11, amount: 36 },
        { name: 'Ice', typeIndex: 14, amount: 36 },
        { name: 'Fairy', typeIndex: 17, amount: 36 },
      ],
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
});

describe('getTargetLevelVector', () => {
  it('Returns a nonzero vector given level 1 power and zero vector', () => {
    const v = getTargetLevelVector({
      targetPower: { mealPower: 'Exp', type: 'Fighting', level: 1 },
      targetConfig: {
        config: 'ONE_THREE_TWO',
        typePlaceIndex: 0,
        mpPlaceIndex: 0,
      },
      typeVector: [],
    });
    expect(v[1]).toBe(1);
  });

  it('Returns a sufficiently high vector with level 3 power and zero vector', () => {
    const v = getTargetLevelVector({
      targetPower: { mealPower: 'Exp', type: 'Fighting', level: 3 },
      targetConfig: {
        config: 'ONE_THREE_TWO',
        typePlaceIndex: 2,
        mpPlaceIndex: 2,
      },
      typeVector: [],
    });
    expect(v[1]).toBe(380);
  });

  it('Targets the target type', () => {
    const v = getTargetLevelVector({
      targetPower: { mealPower: 'Humungo', type: 'Dragon', level: 2 },
      targetConfig: {
        config: 'ONE_THREE_TWO',
        typePlaceIndex: 0,
        mpPlaceIndex: 0,
      },
      typeVector: [
        146, 2, 2, 146, 2, 2, 144, 0, 0, 144, 0, 0, 144, 0, 0, 144, 0, 0,
      ],
    });

    expect(v[15]).toBe(180);
    expect(v[0]).toBe(146);
  });
});
