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

/** If has more than one element, then it is a subset of secondaryFlavorsForPower[power] */
const primaryFlavorsForPower: Flavor[][] = [];
primaryFlavorsForPower[MealPower.EGG] = [Flavor.SWEET];
primaryFlavorsForPower[MealPower.HUMUNGO] = [Flavor.SPICY];
primaryFlavorsForPower[MealPower.TEENSY] = [Flavor.SOUR];
primaryFlavorsForPower[MealPower.ITEM] = [Flavor.BITTER];
primaryFlavorsForPower[MealPower.ENCOUNTER] = [Flavor.SALTY];
primaryFlavorsForPower[MealPower.EXP] = [Flavor.BITTER, Flavor.SALTY];
primaryFlavorsForPower[MealPower.CATCH] = [Flavor.SWEET, Flavor.SOUR];
primaryFlavorsForPower[MealPower.RAID] = [Flavor.SWEET, Flavor.SPICY];
primaryFlavorsForPower[MealPower.TITLE] = [];
primaryFlavorsForPower[MealPower.SPARKLING] = [];

const secondaryFlavorsForPower: Flavor[][] = [];
secondaryFlavorsForPower[MealPower.EGG] = [Flavor.SALTY, Flavor.BITTER];
secondaryFlavorsForPower[MealPower.HUMUNGO] = [
  Flavor.SALTY,
  Flavor.BITTER,
  Flavor.SOUR,
];
secondaryFlavorsForPower[MealPower.TEENSY] = [
  Flavor.SALTY,
  Flavor.BITTER,
  Flavor.SPICY,
];
secondaryFlavorsForPower[MealPower.ITEM] = [
  Flavor.SPICY,
  Flavor.SOUR,
  Flavor.SWEET,
];
secondaryFlavorsForPower[MealPower.ENCOUNTER] = [
  Flavor.SWEET,
  Flavor.SPICY,
  Flavor.SOUR,
];
secondaryFlavorsForPower[MealPower.EXP] = [Flavor.BITTER, Flavor.SALTY];
secondaryFlavorsForPower[MealPower.CATCH] = [Flavor.SWEET, Flavor.SOUR];
secondaryFlavorsForPower[MealPower.RAID] = [Flavor.SWEET, Flavor.SPICY];
secondaryFlavorsForPower[MealPower.TITLE] = [];
secondaryFlavorsForPower[MealPower.SPARKLING] = [];

export const getFlavorProfilesForPower = (mp: MealPower): [Flavor, Flavor][] =>
  primaryFlavorsForPower[mp].flatMap((primary) =>
    secondaryFlavorsForPower[mp]
      .filter((secondary) => secondary !== primary)
      .map((secondary): [Flavor, Flavor] => [primary, secondary]),
  );

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
