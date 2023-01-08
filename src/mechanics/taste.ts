import { Flavor, flavors, MealPower, mealPowers } from '../strings';
import { add, scale } from '../vector-math';
import { Boosts, boostsEqual } from './boost';

export interface FlavorBoost {
  name: Flavor;
  amount: number;
}

const tasteMap: Record<Flavor, Record<Flavor, MealPower>> = {
  Sweet: {
    Sweet: 'Egg',
    Salty: 'Egg',
    Sour: 'Catch',
    Bitter: 'Egg',
    Hot: 'Raid',
  },
  Salty: {
    Salty: 'Encounter',
    Sweet: 'Encounter',
    Sour: 'Encounter',
    Bitter: 'Exp',
    Hot: 'Encounter',
  },
  Sour: {
    Sour: 'Teensy',
    Sweet: 'Catch',
    Salty: 'Teensy',
    Bitter: 'Teensy',
    Hot: 'Teensy',
  },
  Bitter: {
    Bitter: 'Item',
    Sweet: 'Item',
    Salty: 'Exp',
    Sour: 'Item',
    Hot: 'Item',
  },
  Hot: {
    Hot: 'Humungo',
    Sweet: 'Raid',
    Salty: 'Humungo',
    Sour: 'Humungo',
    Bitter: 'Humungo',
  },
};

const primaryFlavorsForPower: Record<MealPower, Flavor[]> = {
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

const secondaryFlavorsForPower: Record<MealPower, Flavor[]> = {
  Egg: ['Salty', 'Bitter'],
  Humungo: ['Salty', 'Bitter', 'Sour'],
  Teensy: ['Salty', 'Bitter', 'Hot'],
  Item: ['Hot', 'Sour', 'Sweet'],
  Encounter: ['Sweet', 'Hot', 'Sour'],
  Exp: ['Salty', 'Bitter'],
  Catch: ['Sour', 'Sweet'],
  Raid: ['Hot', 'Sweet'],
  Title: [],
  Sparkling: [],
};

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

  const firstFlavor = rankedFlavorBoosts[0].name;
  const secondFlavor = rankedFlavorBoosts[1]?.name || firstFlavor;

  return tasteMap[firstFlavor][secondFlavor];
};

export const rankFlavorBoosts = (
  flavorBoosts: Partial<Record<Flavor, number>>,
) =>
  Object.entries(flavorBoosts)
    .sort(
      ([fa, va], [fb, vb]) =>
        vb - va ||
        flavors.indexOf(fa as Flavor) - flavors.indexOf(fb as Flavor),
    )
    .map(([f, v]) => ({ name: f as Flavor, amount: v }));

export interface RelativeTasteVectorProps {
  currentFlavorBoosts: Boosts<Flavor>;
  ingredientFlavorBoosts: Boosts<Flavor>;
}

export const getRelativeTasteVector = (() => {
  let memoRankFlavorBoosts = (
    flavorBoosts: Partial<Record<Flavor, number>>,
  ) => {
    const res = rankFlavorBoosts(flavorBoosts);
    const thisFn = memoRankFlavorBoosts;
    memoRankFlavorBoosts = (b: Partial<Record<Flavor, number>>) =>
      boostsEqual(flavorBoosts, b) ? res : thisFn(b);
    return res;
  };

  return ({
    currentFlavorBoosts,
    ingredientFlavorBoosts,
  }: RelativeTasteVectorProps) => {
    const currentRankedFlavorBoosts = memoRankFlavorBoosts(currentFlavorBoosts);

    const highestBoostAmount = currentRankedFlavorBoosts[0]?.amount || 0;
    const secondHighestBoostAmount = currentRankedFlavorBoosts[1]?.amount || 0;
    const thirdHighestBoostAmount = currentRankedFlavorBoosts[2]?.amount || 0;

    return mealPowers.map((mp, i) => {
      const primaryFlavors = primaryFlavorsForPower[mp];
      const secondaryFlavors = secondaryFlavorsForPower[mp];
      if (primaryFlavors.length === 0) return 0;

      const primaryMatches = primaryFlavors.filter(
        (f) => (currentFlavorBoosts[f] || 0) >= highestBoostAmount,
      );
      const secondaryMatches = secondaryFlavors.filter(
        (f) => (currentFlavorBoosts[f] || 0) >= secondHighestBoostAmount,
      );

      const flavorsCompetingWithPrimary = flavors.filter(
        (f) =>
          !primaryFlavors.includes(f) &&
          (currentFlavorBoosts[f] || 0) >= secondHighestBoostAmount,
      );
      const flavorsCompetingWithSecondary = flavors.filter(
        (f) =>
          !primaryFlavors.includes(f) &&
          !secondaryFlavors.includes(f) &&
          (currentFlavorBoosts[f] || 0) < secondHighestBoostAmount,
      );

      const competingBoosts = flavorsCompetingWithPrimary.map(
        (f) => ingredientFlavorBoosts[f] || 0,
      );
      const maxDetractingBoost = Math.max(...competingBoosts, 0);
      let primaryComponents: number[];

      // TODO?: Deal with moving targets

      if (highestBoostAmount === 0 || primaryMatches.length === 0) {
        primaryComponents = primaryFlavors.map((flavor) => {
          const ingBoost = ingredientFlavorBoosts[flavor] || 0;
          const currentBoost = currentFlavorBoosts[flavor] || 0;
          // Flavor needed to achieve desired power boost
          const primaryThreshold = highestBoostAmount - currentBoost + 1;
          // Difference between highest flavor and the runner up that threatens to change the boosted meal power
          Math.max(highestBoostAmount - secondHighestBoostAmount, 1);
          return (
            50 *
            Math.max(
              Math.min((ingBoost - maxDetractingBoost) / primaryThreshold, 1),
              -1,
            )
          );
        });
      } else {
        primaryComponents = primaryFlavors.map((flavor) => {
          const ingBoost = ingredientFlavorBoosts[flavor] || 0;
          // Difference between highest flavor and the runner up that threatens to change the boosted meal power
          // FIXME another primary is ok
          const primaryThreshold = Math.max(
            highestBoostAmount - secondHighestBoostAmount,
            1,
          );
          return (
            50 *
            Math.max(
              Math.min((ingBoost - maxDetractingBoost) / primaryThreshold, 1),
              -1,
            )
          );
        });
      }
      const halfPrimaryComponent = Math.max(...primaryComponents);
      const competingBoostsSecondary = flavorsCompetingWithSecondary.map(
        (f) => ingredientFlavorBoosts[f] || 0,
      );
      const maxDetractingBoostSecondary = Math.max(
        ...competingBoostsSecondary,
        0,
      );

      let secondaryFlavorComponents: number[];
      if (secondHighestBoostAmount === 0 || secondaryMatches.length === 0) {
        secondaryFlavorComponents = secondaryFlavors.map((flavor) => {
          const ingBoost = ingredientFlavorBoosts[flavor] || 0;
          const currentBoost = currentFlavorBoosts[flavor] || 0;

          // Flavor needed to achieve desired power boost
          // Assumption: secondaryThreshold > 0
          const secondaryThreshold =
            secondHighestBoostAmount - currentBoost + 1;
          return (
            50 *
            Math.max(
              Math.min(
                (ingBoost - maxDetractingBoostSecondary) / secondaryThreshold,
                1,
              ),
              -1,
            )
          );
        });
      } else {
        // Difference between highest flavor and the runner up that threatens to change the boosted meal power
        secondaryFlavorComponents = secondaryMatches.map((flavor) => {
          const ingBoost = ingredientFlavorBoosts[flavor] || 0;

          const oneTwo = highestBoostAmount - secondHighestBoostAmount;
          const twoThree = secondHighestBoostAmount - thirdHighestBoostAmount;
          const secondaryThreshold =
            primaryMatches.length > 0 && oneTwo > twoThree
              ? Math.min(-oneTwo, -1)
              : Math.max(twoThree, 1);
          return (
            50 *
            Math.max(
              Math.min(
                (ingBoost - maxDetractingBoostSecondary) / secondaryThreshold,
                1,
              ),
              -1,
            )
          );
        });
      }
      const halfRelSecondaryComponent = Math.max(...secondaryFlavorComponents);

      return halfPrimaryComponent + halfRelSecondaryComponent;
    });
  };
})();
