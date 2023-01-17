import { Flavor, MealPower, rangeFlavors } from '../enum';
import {
  getBoostedMealPower,
  getRelativeTasteVector,
  rankFlavorBoosts,
} from './taste';

describe('rankFlavorBoosts', () => {
  it('Orders flavors in descending order', () => {
    const flavorVector = rangeFlavors.map(() => 0);
    flavorVector[Flavor.BITTER] = 1;
    flavorVector[Flavor.SWEET] = 3;
    flavorVector[Flavor.SOUR] = 2;
    const ranked = rankFlavorBoosts(flavorVector);
    expect(ranked[0].flavor).toBe(Flavor.SWEET);
    expect(ranked[1].flavor).toBe(Flavor.SOUR);
    expect(ranked[2].flavor).toBe(Flavor.BITTER);
  });

  it('Breaks ties using Sweet > Sour > Salty > Bitter > Hot', () => {
    const flavorVector = rangeFlavors.map(() => 0);
    flavorVector[Flavor.SOUR] = 1;
    flavorVector[Flavor.SWEET] = 1;
    flavorVector[Flavor.SALTY] = 1;
    const ranked = rankFlavorBoosts(flavorVector);
    expect(ranked[0].flavor).toBe(Flavor.SWEET);
    expect(ranked[1].flavor).toBe(Flavor.SOUR);
    expect(ranked[2].flavor).toBe(Flavor.SALTY);
  });
});

describe('getBoostedMealPower', () => {
  it('Returns null for all-negative boosts', () => {
    const flavorVector = rangeFlavors.map(() => 0);
    flavorVector[Flavor.BITTER] = -5;
    flavorVector[Flavor.SOUR] = -10;
    const rankedFlavorBoosts = rankFlavorBoosts(flavorVector);
    const boosted = getBoostedMealPower(rankedFlavorBoosts);
    expect(boosted).toBeNull();
  });

  it("Doesn't use 0 for a combined taste", () => {
    const flavorVector = rangeFlavors.map(() => 0);
    flavorVector[Flavor.SWEET] = 5;
    flavorVector[Flavor.BITTER] = -5;
    flavorVector[Flavor.SPICY] = -5;
    flavorVector[Flavor.SALTY] = -5;
    const rankedFlavorBoosts = rankFlavorBoosts(flavorVector);
    const boosted = getBoostedMealPower(rankedFlavorBoosts);
    expect(boosted).toBe(MealPower.EGG);
  });

  it('Correctly determines Egg boosts', () => {
    const flavorVector = rangeFlavors.map(() => 0);
    flavorVector[Flavor.SWEET] = 5;
    flavorVector[Flavor.BITTER] = 3;
    flavorVector[Flavor.SPICY] = 2;
    flavorVector[Flavor.SALTY] = 1;
    flavorVector[Flavor.SOUR] = 1;
    const ranked1 = rankFlavorBoosts(flavorVector);
    const boosted1 = getBoostedMealPower(ranked1);
    expect(boosted1).toBe(MealPower.EGG);

    const flavorVector2 = rangeFlavors.map(() => 0);
    flavorVector2[Flavor.SWEET] = 5;
    flavorVector2[Flavor.BITTER] = 1;
    flavorVector2[Flavor.SPICY] = 2;
    flavorVector2[Flavor.SALTY] = 3;
    flavorVector2[Flavor.SOUR] = 1;
    const ranked2 = rankFlavorBoosts(flavorVector2);
    const boosted2 = getBoostedMealPower(ranked2);
    expect(boosted2).toBe(MealPower.EGG);
  });

  it('Correctly determines Humungo boosts', () => {
    const flavorVector = rangeFlavors.map(() => 0);
    flavorVector[Flavor.SWEET] = 2;
    flavorVector[Flavor.BITTER] = 3;
    flavorVector[Flavor.SPICY] = 5;
    flavorVector[Flavor.SALTY] = 1;
    flavorVector[Flavor.SOUR] = 1;
    const ranked1 = rankFlavorBoosts(flavorVector);
    const boosted1 = getBoostedMealPower(ranked1);
    expect(boosted1).toBe(MealPower.HUMUNGO);

    const flavorVector2 = rangeFlavors.map(() => 0);
    flavorVector2[Flavor.SWEET] = 2;
    flavorVector2[Flavor.BITTER] = 1;
    flavorVector2[Flavor.SPICY] = 5;
    flavorVector2[Flavor.SALTY] = 3;
    flavorVector2[Flavor.SOUR] = 1;
    const ranked2 = rankFlavorBoosts(flavorVector2);
    const boosted2 = getBoostedMealPower(ranked2);
    expect(boosted2).toBe(MealPower.HUMUNGO);

    const flavorVector3 = rangeFlavors.map(() => 0);
    flavorVector3[Flavor.SWEET] = 2;
    flavorVector3[Flavor.BITTER] = 1;
    flavorVector3[Flavor.SPICY] = 5;
    flavorVector3[Flavor.SALTY] = 1;
    flavorVector3[Flavor.SOUR] = 3;
    const ranked3 = rankFlavorBoosts(flavorVector3);
    const boosted3 = getBoostedMealPower(ranked3);
    expect(boosted3).toBe(MealPower.HUMUNGO);
  });

  it('Correctly determines Teensy boosts', () => {
    const flavorVector = rangeFlavors.map(() => 0);
    flavorVector[Flavor.SWEET] = 2;
    flavorVector[Flavor.BITTER] = 3;
    flavorVector[Flavor.SPICY] = 1;
    flavorVector[Flavor.SALTY] = 1;
    flavorVector[Flavor.SOUR] = 5;
    const ranked1 = rankFlavorBoosts(flavorVector);
    const boosted1 = getBoostedMealPower(ranked1);
    expect(boosted1).toBe(MealPower.TEENSY);

    const flavorVector2 = rangeFlavors.map(() => 0);
    flavorVector2[Flavor.SWEET] = 2;
    flavorVector2[Flavor.BITTER] = 1;
    flavorVector2[Flavor.SPICY] = 3;
    flavorVector2[Flavor.SALTY] = 1;
    flavorVector2[Flavor.SOUR] = 5;
    const ranked2 = rankFlavorBoosts(flavorVector2);
    const boosted2 = getBoostedMealPower(ranked2);
    expect(boosted2).toBe(MealPower.TEENSY);

    const flavorVector3 = rangeFlavors.map(() => 0);
    flavorVector3[Flavor.SWEET] = 2;
    flavorVector3[Flavor.BITTER] = 1;
    flavorVector3[Flavor.SPICY] = 1;
    flavorVector3[Flavor.SALTY] = 3;
    flavorVector3[Flavor.SOUR] = 5;
    const ranked3 = rankFlavorBoosts(flavorVector3);
    const boosted3 = getBoostedMealPower(ranked3);
    expect(boosted3).toBe(MealPower.TEENSY);
  });

  it('Correctly determines Item boosts', () => {
    const flavorVector = rangeFlavors.map(() => 0);
    flavorVector[Flavor.SWEET] = 3;
    flavorVector[Flavor.BITTER] = 5;
    flavorVector[Flavor.SPICY] = 1;
    flavorVector[Flavor.SALTY] = 2;
    flavorVector[Flavor.SOUR] = 1;
    const ranked1 = rankFlavorBoosts(flavorVector);
    const boosted1 = getBoostedMealPower(ranked1);
    expect(boosted1).toBe(MealPower.ITEM);

    const flavorVector2 = rangeFlavors.map(() => 0);
    flavorVector2[Flavor.SWEET] = 1;
    flavorVector2[Flavor.BITTER] = 5;
    flavorVector2[Flavor.SPICY] = 3;
    flavorVector2[Flavor.SALTY] = 2;
    flavorVector2[Flavor.SOUR] = 1;
    const ranked2 = rankFlavorBoosts(flavorVector2);
    const boosted2 = getBoostedMealPower(ranked2);
    expect(boosted2).toBe(MealPower.ITEM);

    const flavorVector3 = rangeFlavors.map(() => 0);
    flavorVector3[Flavor.SWEET] = 1;
    flavorVector3[Flavor.BITTER] = 5;
    flavorVector3[Flavor.SPICY] = 1;
    flavorVector3[Flavor.SALTY] = 2;
    flavorVector3[Flavor.SOUR] = 3;
    const ranked3 = rankFlavorBoosts(flavorVector3);
    const boosted3 = getBoostedMealPower(ranked3);
    expect(boosted3).toBe(MealPower.ITEM);
  });

  it('Correctly determines Encounter boosts', () => {
    const flavorVector = rangeFlavors.map(() => 0);
    flavorVector[Flavor.SWEET] = 3;
    flavorVector[Flavor.BITTER] = 2;
    flavorVector[Flavor.SPICY] = 1;
    flavorVector[Flavor.SALTY] = 5;
    flavorVector[Flavor.SOUR] = 1;
    const ranked1 = rankFlavorBoosts(flavorVector);
    const boosted1 = getBoostedMealPower(ranked1);
    expect(boosted1).toBe(MealPower.ENCOUNTER);

    const flavorVector2 = rangeFlavors.map(() => 0);
    flavorVector2[Flavor.SWEET] = 1;
    (flavorVector2[Flavor.BITTER] = 2), (flavorVector2[Flavor.SPICY] = 3);
    flavorVector2[Flavor.SALTY] = 5;
    flavorVector2[Flavor.SOUR] = 1;
    const ranked2 = rankFlavorBoosts(flavorVector2);
    const boosted2 = getBoostedMealPower(ranked2);
    expect(boosted2).toBe(MealPower.ENCOUNTER);

    const flavorVector3 = rangeFlavors.map(() => 0);
    flavorVector3[Flavor.SWEET] = 1;
    flavorVector3[Flavor.BITTER] = 2;
    flavorVector3[Flavor.SPICY] = 1;
    flavorVector3[Flavor.SALTY] = 5;
    flavorVector3[Flavor.SOUR] = 3;
    const ranked3 = rankFlavorBoosts(flavorVector);
    const boosted3 = getBoostedMealPower(ranked3);
    expect(boosted3).toBe(MealPower.ENCOUNTER);
  });

  it('Correctly determines Exp boosts', () => {
    const flavorVector = rangeFlavors.map(() => 0);
    flavorVector[Flavor.SWEET] = 2;
    flavorVector[Flavor.BITTER] = 5;
    flavorVector[Flavor.SPICY] = 1;
    flavorVector[Flavor.SALTY] = 3;
    flavorVector[Flavor.SOUR] = 1;
    const ranked1 = rankFlavorBoosts(flavorVector);
    const boosted1 = getBoostedMealPower(ranked1);
    expect(boosted1).toBe(MealPower.EXP);

    const flavorVector2 = rangeFlavors.map(() => 0);
    flavorVector2[Flavor.SWEET] = 1;
    flavorVector2[Flavor.BITTER] = 3;
    flavorVector2[Flavor.SPICY] = 2;
    flavorVector2[Flavor.SALTY] = 5;
    flavorVector2[Flavor.SOUR] = 1;
    const ranked2 = rankFlavorBoosts(flavorVector2);
    const boosted2 = getBoostedMealPower(ranked2);
    expect(boosted2).toBe(MealPower.EXP);
  });

  it('Correctly determines Catch boosts', () => {
    const flavorVector = rangeFlavors.map(() => 0);
    flavorVector[Flavor.SWEET] = 5;
    flavorVector[Flavor.BITTER] = 2;
    flavorVector[Flavor.SPICY] = 1;
    flavorVector[Flavor.SALTY] = 1;
    flavorVector[Flavor.SOUR] = 3;
    const ranked1 = rankFlavorBoosts(flavorVector);
    const boosted1 = getBoostedMealPower(ranked1);
    expect(boosted1).toBe(MealPower.CATCH);

    const flavorVector2 = rangeFlavors.map(() => 0);
    flavorVector2[Flavor.SWEET] = 3;
    (flavorVector2[Flavor.BITTER] = 1), (flavorVector2[Flavor.SPICY] = 2);
    flavorVector2[Flavor.SALTY] = 1;
    flavorVector2[Flavor.SOUR] = 5;
    const ranked2 = rankFlavorBoosts(flavorVector2);
    const boosted2 = getBoostedMealPower(ranked2);
    expect(boosted2).toBe(MealPower.CATCH);
  });

  it('Correctly determines Raid boosts', () => {
    const flavorVector = rangeFlavors.map(() => 0);
    flavorVector[Flavor.SWEET] = 5;
    flavorVector[Flavor.BITTER] = 1;
    flavorVector[Flavor.SPICY] = 3;
    flavorVector[Flavor.SALTY] = 2;
    flavorVector[Flavor.SOUR] = 1;
    const ranked1 = rankFlavorBoosts(flavorVector);
    const boosted1 = getBoostedMealPower(ranked1);
    expect(boosted1).toBe(MealPower.RAID);

    const flavorVector2 = rangeFlavors.map(() => 0);
    flavorVector2[Flavor.SWEET] = 3;
    flavorVector2[Flavor.BITTER] = 1;
    flavorVector2[Flavor.SPICY] = 5;
    flavorVector2[Flavor.SALTY] = 1;
    flavorVector2[Flavor.SOUR] = 2;
    const ranked2 = rankFlavorBoosts(flavorVector2);
    const boosted2 = getBoostedMealPower(ranked2);
    expect(boosted2).toBe(MealPower.RAID);
  });
});

describe('getRelativeTasteVector', () => {
  it('Does not output infinite components', () => {
    const currentFlavorVector = rangeFlavors.map(() => 0);
    currentFlavorVector[Flavor.SALTY] = 20;
    currentFlavorVector[Flavor.SPICY] = 20;
    currentFlavorVector[Flavor.SWEET] = 16;
    const ingredientFlavorVector = rangeFlavors.map(() => 0);
    ingredientFlavorVector[Flavor.SWEET] = 12;
    ingredientFlavorVector[Flavor.SOUR] = 3;
    const res = getRelativeTasteVector({
      currentFlavorVector,
      ingredientFlavorVector,
    });

    expect(res).not.toContain(Infinity);
    expect(res).not.toContain(-Infinity);
  });

  it('Does not output any NaN components', () => {
    const currentFlavorVector = rangeFlavors.map(() => 0);
    currentFlavorVector[Flavor.BITTER] = 500;
    const ingredientFlavorVector = rangeFlavors.map(() => 0);
    ingredientFlavorVector[Flavor.SWEET] = 12;
    ingredientFlavorVector[Flavor.SOUR] = 9;
    ingredientFlavorVector[Flavor.BITTER] = 3;
    const res = getRelativeTasteVector({
      currentFlavorVector,
      ingredientFlavorVector,
    });

    const nanIndex = res.findIndex(isNaN);
    expect(nanIndex).toBe(-1);
  });

  it('Does not output a vector where any component has abs value >100', () => {
    const currentFlavorVector = rangeFlavors.map(() => 0);
    currentFlavorVector[Flavor.SALTY] = 48;
    currentFlavorVector[Flavor.SPICY] = 48;
    currentFlavorVector[Flavor.BITTER] = 24;
    const ingredientFlavorVector1 = rangeFlavors.map(() => 0);
    ingredientFlavorVector1[Flavor.SWEET] = 12;
    ingredientFlavorVector1[Flavor.SOUR] = 3;
    const res1 = getRelativeTasteVector({
      currentFlavorVector,
      ingredientFlavorVector: ingredientFlavorVector1,
    });
    const gt100_1 = res1.find((c) => Math.abs(c) > 100);
    expect(gt100_1).toBeUndefined();

    const ingredientFlavorVector2 = rangeFlavors.map(() => 0);
    ingredientFlavorVector2[Flavor.SWEET] = 16;
    ingredientFlavorVector2[Flavor.SALTY] = 12;
    const res2 = getRelativeTasteVector({
      currentFlavorVector,
      ingredientFlavorVector: ingredientFlavorVector2,
    });
    const gt100_2 = res2.find((c) => Math.abs(c) > 100);
    expect(gt100_2).toBeUndefined();
  });

  it('Outputs a positive Egg component when adding banana to chorizo', () => {
    const currentFlavorVector = rangeFlavors.map(() => 0);
    currentFlavorVector[Flavor.SALTY] = 48;
    currentFlavorVector[Flavor.BITTER] = 24;
    currentFlavorVector[Flavor.SPICY] = 48;

    const ingredientFlavorVector = rangeFlavors.map(() => 0);
    ingredientFlavorVector[Flavor.SWEET] = 12;
    ingredientFlavorVector[Flavor.SOUR] = 3;
    const res = getRelativeTasteVector({
      currentFlavorVector,
      ingredientFlavorVector,
    });

    expect(res[0]).toBeGreaterThan(0);
  });

  it('Outputs a positive Humungo component when adding Curry Powder to chorizo', () => {
    const currentFlavorVector = rangeFlavors.map(() => 0);
    currentFlavorVector[Flavor.SALTY] = 48;
    currentFlavorVector[Flavor.BITTER] = 24;
    currentFlavorVector[Flavor.SPICY] = 48;

    const ingredientFlavorVector = rangeFlavors.map(() => 0);
    ingredientFlavorVector[Flavor.SPICY] = 30;
    ingredientFlavorVector[Flavor.BITTER] = 12;
    ingredientFlavorVector[Flavor.SWEET] = 4;
    ingredientFlavorVector[Flavor.SALTY] = 4;
    ingredientFlavorVector[Flavor.SOUR] = 4;

    const res = getRelativeTasteVector({
      currentFlavorVector,
      ingredientFlavorVector,
    });

    expect(res[7]).toBeGreaterThan(0);
  });

  it('Outputs an Egg component for banana higher than that for fried fillet when adding to chorizo', () => {
    const currentFlavorVector = rangeFlavors.map(() => 0);
    currentFlavorVector[Flavor.SALTY] = 48;
    currentFlavorVector[Flavor.BITTER] = 24;
    currentFlavorVector[Flavor.SPICY] = 48;

    const bananaFlavorVector = rangeFlavors.map(() => 0);
    bananaFlavorVector[Flavor.SWEET] = 12;
    bananaFlavorVector[Flavor.SOUR] = 3;
    const bananaRes = getRelativeTasteVector({
      currentFlavorVector,
      ingredientFlavorVector: bananaFlavorVector,
    });

    const friedFlavorVector = rangeFlavors.map(() => 0);
    friedFlavorVector[Flavor.SALTY] = 3;
    friedFlavorVector[Flavor.BITTER] = 3;
    friedFlavorVector[Flavor.SWEET] = 2;
    const friedRes = getRelativeTasteVector({
      currentFlavorVector,
      ingredientFlavorVector: friedFlavorVector,
    });

    expect(bananaRes[0] - friedRes[0]).toBeGreaterThan(0);
  });

  it("Doesn't output a positive Exp component when adding banana to 4x chorizo + 1 potato salad", () => {
    const currentFlavorVector = rangeFlavors.map(() => 0);
    currentFlavorVector[Flavor.SALTY] = 51;
    currentFlavorVector[Flavor.SWEET] = 2;
    currentFlavorVector[Flavor.BITTER] = 25;
    currentFlavorVector[Flavor.SPICY] = 48;
    currentFlavorVector[Flavor.SOUR] = 4;

    const ingredientFlavorVector = rangeFlavors.map(() => 0);
    ingredientFlavorVector[Flavor.SWEET] = 12;
    ingredientFlavorVector[Flavor.SOUR] = 3;
    const res = getRelativeTasteVector({
      currentFlavorVector,
      ingredientFlavorVector,
    });

    expect(res[2]).toBeLessThanOrEqual(0);
  });

  it('Outputs nonzero components when choosing Herba Mystica at the start', () => {
    const currentFlavorVector = rangeFlavors.map(() => 0);
    const ingredientFlavorVector = rangeFlavors.map(() => 0);
    ingredientFlavorVector[Flavor.SWEET] = 500;
    const res = getRelativeTasteVector({
      currentFlavorVector,
      ingredientFlavorVector,
    });

    expect(res[0] || 0).toBeGreaterThan(0);
  });

  it('Outputs a higher Teensy component for Sour Herba Mystica than that for Bitter Herba Mystica', () => {
    const currentFlavorVector = rangeFlavors.map(() => 0);
    const sourHerbaFlavorVector = rangeFlavors.map(() => 0);
    sourHerbaFlavorVector[Flavor.SOUR] = 500;
    const sour = getRelativeTasteVector({
      currentFlavorVector,
      ingredientFlavorVector: sourHerbaFlavorVector,
    });
    const bitterHerbaFlavorVector = rangeFlavors.map(() => 0);
    bitterHerbaFlavorVector[Flavor.BITTER] = 500;
    const bitter = getRelativeTasteVector({
      currentFlavorVector,
      ingredientFlavorVector: bitterHerbaFlavorVector,
    });

    expect(sour[8]).toBeGreaterThan(bitter[8]);
  });
});
