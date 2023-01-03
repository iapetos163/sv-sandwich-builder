import {
  getBoostedMealPower,
  getRelativeTasteVector,
  makeMealPowerVectors,
  rankFlavorBoosts,
} from './taste';

describe('rankFlavorBoosts', () => {
  it('Orders flavors in descending order', () => {
    const ranked = rankFlavorBoosts({
      Bitter: 1,
      Sweet: 3,
      Sour: 2,
    });
    expect(ranked[0].name).toBe('Sweet');
    expect(ranked[1].name).toBe('Sour');
    expect(ranked[2].name).toBe('Bitter');
  });

  it('Breaks ties using Sweet > Sour > Salty > Bitter > Hot', () => {
    const ranked = rankFlavorBoosts({
      Sour: 1,
      Sweet: 1,
      Salty: 1,
    });
    expect(ranked[0].name).toBe('Sweet');
    expect(ranked[1].name).toBe('Sour');
    expect(ranked[2].name).toBe('Salty');
  });
});

describe('getBoostedMealPower', () => {
  it('Returns null for all-negative boosts', () => {
    const rankedFlavorBoosts = rankFlavorBoosts({
      Bitter: -5,
      Sour: -10,
    });
    const boosted = getBoostedMealPower(rankedFlavorBoosts);
    expect(boosted).toBeNull();
  });

  it("Doesn't use 0 for a combined taste", () => {
    const rankedFlavorBoosts = rankFlavorBoosts({
      Sweet: 5,
      Bitter: -5,
      Hot: -5,
      Salty: -5,
    });
    const boosted = getBoostedMealPower(rankedFlavorBoosts);
    expect(boosted).toBe('Egg');
  });

  it('Correctly determines Egg boosts', () => {
    const ranked1 = rankFlavorBoosts({
      Sweet: 5,
      Bitter: 3,
      Hot: 2,
      Salty: 1,
      Sour: 1,
    });
    const boosted1 = getBoostedMealPower(ranked1);
    expect(boosted1).toBe('Egg');

    const ranked2 = rankFlavorBoosts({
      Sweet: 5,
      Bitter: 1,
      Hot: 2,
      Salty: 3,
      Sour: 1,
    });
    const boosted2 = getBoostedMealPower(ranked2);
    expect(boosted2).toBe('Egg');
  });

  it('Correctly determines Humungo boosts', () => {
    const ranked1 = rankFlavorBoosts({
      Sweet: 2,
      Bitter: 3,
      Hot: 5,
      Salty: 1,
      Sour: 1,
    });
    const boosted1 = getBoostedMealPower(ranked1);
    expect(boosted1).toBe('Humungo');

    const ranked2 = rankFlavorBoosts({
      Sweet: 2,
      Bitter: 1,
      Hot: 5,
      Salty: 3,
      Sour: 1,
    });
    const boosted2 = getBoostedMealPower(ranked2);
    expect(boosted2).toBe('Humungo');

    const ranked3 = rankFlavorBoosts({
      Sweet: 2,
      Bitter: 1,
      Hot: 5,
      Salty: 1,
      Sour: 3,
    });
    const boosted3 = getBoostedMealPower(ranked3);
    expect(boosted3).toBe('Humungo');
  });

  it('Correctly determines Teensy boosts', () => {
    const ranked1 = rankFlavorBoosts({
      Sweet: 2,
      Bitter: 3,
      Hot: 1,
      Salty: 1,
      Sour: 5,
    });
    const boosted1 = getBoostedMealPower(ranked1);
    expect(boosted1).toBe('Teensy');

    const ranked2 = rankFlavorBoosts({
      Sweet: 2,
      Bitter: 1,
      Hot: 3,
      Salty: 1,
      Sour: 5,
    });
    const boosted2 = getBoostedMealPower(ranked2);
    expect(boosted2).toBe('Teensy');

    const ranked3 = rankFlavorBoosts({
      Sweet: 2,
      Bitter: 1,
      Hot: 1,
      Salty: 3,
      Sour: 5,
    });
    const boosted3 = getBoostedMealPower(ranked3);
    expect(boosted3).toBe('Teensy');
  });

  it('Correctly determines Item boosts', () => {
    const ranked1 = rankFlavorBoosts({
      Sweet: 3,
      Bitter: 5,
      Hot: 1,
      Salty: 2,
      Sour: 1,
    });
    const boosted1 = getBoostedMealPower(ranked1);
    expect(boosted1).toBe('Item');

    const ranked2 = rankFlavorBoosts({
      Sweet: 1,
      Bitter: 5,
      Hot: 3,
      Salty: 2,
      Sour: 1,
    });
    const boosted2 = getBoostedMealPower(ranked2);
    expect(boosted2).toBe('Item');

    const ranked3 = rankFlavorBoosts({
      Sweet: 1,
      Bitter: 5,
      Hot: 1,
      Salty: 2,
      Sour: 3,
    });
    const boosted3 = getBoostedMealPower(ranked3);
    expect(boosted3).toBe('Item');
  });

  it('Correctly determines Encounter boosts', () => {
    const ranked1 = rankFlavorBoosts({
      Sweet: 3,
      Bitter: 2,
      Hot: 1,
      Salty: 5,
      Sour: 1,
    });
    const boosted1 = getBoostedMealPower(ranked1);
    expect(boosted1).toBe('Encounter');

    const ranked2 = rankFlavorBoosts({
      Sweet: 1,
      Bitter: 2,
      Hot: 3,
      Salty: 5,
      Sour: 1,
    });
    const boosted2 = getBoostedMealPower(ranked2);
    expect(boosted2).toBe('Encounter');

    const ranked3 = rankFlavorBoosts({
      Sweet: 1,
      Bitter: 2,
      Hot: 1,
      Salty: 5,
      Sour: 3,
    });
    const boosted3 = getBoostedMealPower(ranked3);
    expect(boosted3).toBe('Encounter');
  });

  it('Correctly determines Exp boosts', () => {
    const ranked1 = rankFlavorBoosts({
      Sweet: 2,
      Bitter: 5,
      Hot: 1,
      Salty: 3,
      Sour: 1,
    });
    const boosted1 = getBoostedMealPower(ranked1);
    expect(boosted1).toBe('Exp');

    const ranked2 = rankFlavorBoosts({
      Sweet: 1,
      Bitter: 3,
      Hot: 2,
      Salty: 5,
      Sour: 1,
    });
    const boosted2 = getBoostedMealPower(ranked2);
    expect(boosted2).toBe('Exp');
  });

  it('Correctly determines Catch boosts', () => {
    const ranked1 = rankFlavorBoosts({
      Sweet: 5,
      Bitter: 2,
      Hot: 1,
      Salty: 1,
      Sour: 3,
    });
    const boosted1 = getBoostedMealPower(ranked1);
    expect(boosted1).toBe('Catch');

    const ranked2 = rankFlavorBoosts({
      Sweet: 3,
      Bitter: 1,
      Hot: 2,
      Salty: 1,
      Sour: 5,
    });
    const boosted2 = getBoostedMealPower(ranked2);
    expect(boosted2).toBe('Catch');
  });

  it('Correctly determines Raid boosts', () => {
    const ranked1 = rankFlavorBoosts({
      Sweet: 5,
      Bitter: 1,
      Hot: 3,
      Salty: 2,
      Sour: 1,
    });
    const boosted1 = getBoostedMealPower(ranked1);
    expect(boosted1).toBe('Raid');

    const ranked2 = rankFlavorBoosts({
      Sweet: 3,
      Bitter: 1,
      Hot: 5,
      Salty: 1,
      Sour: 2,
    });
    const boosted2 = getBoostedMealPower(ranked2);
    expect(boosted2).toBe('Raid');
  });
});

describe('getRelativeTasteVector', () => {
  it('Does not output infinite components', () => {
    const res = getRelativeTasteVector({
      currentFlavorBoosts: { Salty: 20, Hot: 20, Sweet: 16 },
      primaryTasteVector: [
        3, 14.8492424049175, 2.121320343559643, 3, 8.485281374238571, 0, 0, -12,
        -3, -3,
      ],
      secondaryTasteVector: [],
    });

    expect(res).not.toContain(Infinity);
    expect(res).not.toContain(-Infinity);
  });

  it('Does not output a vector where any component has abs value >100', () => {
    const res1 = getRelativeTasteVector({
      currentFlavorBoosts: { Salty: 48, Hot: 48, Bitter: 24 },
      primaryTasteVector: [9, 12, -12, 0, 9, 0, 0, -12, -9, -12],
      secondaryTasteVector: [0, 3, 0, 12, 0, 0, 0, 0, 0, 0],
    });
    const gt100_1 = res1.find((c) => Math.abs(c) > 100);
    expect(gt100_1).toBeUndefined();

    const res2 = getRelativeTasteVector({
      currentFlavorBoosts: {},
      primaryTasteVector: [0, -20, 4, -16, -20, 0, 0, -20, -20, 16],
      secondaryTasteVector: [20, 0, 20, 0, 0, 0, 0, 0, 0, 0],
    });
    const gt100_2 = res2.find((c) => Math.abs(c) > 100);
    expect(gt100_2).toBeUndefined();
  });

  it('Outputs a positive Egg component when adding banana to chorizo', () => {
    const res = getRelativeTasteVector({
      currentFlavorBoosts: { Salty: 48, Bitter: 24, Hot: 48 },
      primaryTasteVector: [12, 12, -12, 0, 12, 0, 0, -12, -9, -12],
      secondaryTasteVector: [-3, 3, 0, 12, -3, 0, 0, 0, 0, 0],
    });

    expect(res[0]).toBeGreaterThan(0);
  });
});

describe('makeMealPowerVectors', () => {
  it('Makes the expected Egg components for Banana', () => {
    const { primary, secondary } = makeMealPowerVectors(
      { Sweet: 4, Sour: 1 },
      3,
    );
    expect(primary[0]).toBe(12);
    expect(secondary[0]).toBe(-3);
  });
});
