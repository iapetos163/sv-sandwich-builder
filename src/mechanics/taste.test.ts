import { Flavor, MealPower, rangeFlavors } from '../enum';
import { getBoostedMealPower, rankFlavorBoosts } from './taste';

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
