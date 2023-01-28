import { Flavor, MealPower, rangeMealPowers } from '../enum';

export interface FlavorBoost {
  flavor: Flavor;
  amount: number;
}

const tasteMap: MealPower[][] = rangeMealPowers.map(() => []);
tasteMap[Flavor.SWEET][Flavor.SWEET] = MealPower.EGG;
tasteMap[Flavor.SWEET][Flavor.SALTY] = MealPower.EGG;
tasteMap[Flavor.SWEET][Flavor.SOUR] = MealPower.CATCH;
tasteMap[Flavor.SWEET][Flavor.BITTER] = MealPower.EGG;
tasteMap[Flavor.SWEET][Flavor.SPICY] = MealPower.RAID;

tasteMap[Flavor.SALTY][Flavor.SALTY] = MealPower.ENCOUNTER;
tasteMap[Flavor.SALTY][Flavor.SWEET] = MealPower.ENCOUNTER;
tasteMap[Flavor.SALTY][Flavor.SOUR] = MealPower.ENCOUNTER;
tasteMap[Flavor.SALTY][Flavor.BITTER] = MealPower.EXP;
tasteMap[Flavor.SALTY][Flavor.SPICY] = MealPower.ENCOUNTER;

tasteMap[Flavor.SOUR][Flavor.SALTY] = MealPower.TEENSY;
tasteMap[Flavor.SOUR][Flavor.SWEET] = MealPower.CATCH;
tasteMap[Flavor.SOUR][Flavor.SOUR] = MealPower.TEENSY;
tasteMap[Flavor.SOUR][Flavor.BITTER] = MealPower.TEENSY;
tasteMap[Flavor.SOUR][Flavor.SPICY] = MealPower.TEENSY;

tasteMap[Flavor.BITTER][Flavor.SALTY] = MealPower.EXP;
tasteMap[Flavor.BITTER][Flavor.SWEET] = MealPower.ITEM;
tasteMap[Flavor.BITTER][Flavor.SOUR] = MealPower.ITEM;
tasteMap[Flavor.BITTER][Flavor.BITTER] = MealPower.ITEM;
tasteMap[Flavor.BITTER][Flavor.SPICY] = MealPower.ITEM;

tasteMap[Flavor.SPICY][Flavor.SALTY] = MealPower.HUMUNGO;
tasteMap[Flavor.SPICY][Flavor.SWEET] = MealPower.RAID;
tasteMap[Flavor.SPICY][Flavor.SOUR] = MealPower.HUMUNGO;
tasteMap[Flavor.SPICY][Flavor.BITTER] = MealPower.HUMUNGO;
tasteMap[Flavor.SPICY][Flavor.SPICY] = MealPower.HUMUNGO;

/*
  const componentFlavors: Record<MealPower, Flavor[]> = {
    Egg: ['Sweet'],
    Humungo: ['Hot'],
    Teensy: ['Sour'],
    Item: ['Bitter'],
    Encounter: ['Salty'],
    Exp: ['Bitter', 'Salty'],
    Catch: ['Sweet', 'Sour'],
    Raid: ['Sweet', 'Hot'],
    Title: [],
    Sparkling: [],
  };
  */

export const getBoostedMealPower = (rankedFlavorBoosts: FlavorBoost[]) => {
  if (rankedFlavorBoosts.length === 0 || rankedFlavorBoosts[0].amount <= 0) {
    return null;
  }

  const firstFlavor = rankedFlavorBoosts[0].flavor;
  const secondFlavor =
    rankedFlavorBoosts[1] && rankedFlavorBoosts[1].amount > 0
      ? rankedFlavorBoosts[1].flavor
      : firstFlavor;

  return tasteMap[firstFlavor][secondFlavor];
};

export const rankFlavorBoosts = (flavorVector: number[]) =>
  flavorVector
    .map((amount, flavor) => ({ flavor, amount }))
    .sort((a, b) => b.amount - a.amount || a.flavor - b.flavor);
