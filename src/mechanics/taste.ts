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

const primaryFlavorsForPower: Record<MealPower, Flavor | null> = {
  Egg: 'Sweet',
  Humungo: 'Hot',
  Teensy: 'Sour',
  Item: 'Bitter',
  Encounter: 'Salty',
  Exp: 'Bitter',
  Catch: 'Sweet',
  Raid: 'Sweet',
  Title: null,
  Sparkling: null,
};

const secondaryFlavorsForPower: Record<MealPower, Flavor[]> = {
  Egg: ['Salty', 'Bitter'],
  Humungo: [],
  Teensy: [],
  Item: ['Hot', 'Sour', 'Sweet'],
  Encounter: [],
  Exp: ['Salty'],
  Catch: ['Sour'],
  Raid: ['Hot'],
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
    const highestBoostedFlavor = currentRankedFlavorBoosts[0]?.name;
    const secondHighestBoostAmount = currentRankedFlavorBoosts[1]?.amount || 0;
    const thirdHighestBoostAmount = currentRankedFlavorBoosts[2]?.amount || 0;

    return mealPowers.map((mp, i) => {
      const primaryFlavor = primaryFlavorsForPower[mp];
      const secondaryFlavors = secondaryFlavorsForPower[mp];
      if (!primaryFlavor) return 0;

      const ingPrimaryBoost = ingredientFlavorBoosts[primaryFlavor] || 0;
      const currentPrimaryBoost = currentFlavorBoosts[primaryFlavor] || 0;
      let relPrimaryComponent: number;
      // TODO?: Deal with moving targets
      if (
        currentPrimaryBoost === 0 ||
        currentPrimaryBoost !== highestBoostAmount
      ) {
        // Flavor needed to achieve desired power boost
        // Assumption: needed > 0
        const needed = highestBoostAmount - currentPrimaryBoost + 1;

        const invScaleFactor = Math.max(needed, needed - ingPrimaryBoost);
        relPrimaryComponent =
          100 * Math.max(Math.min(ingPrimaryBoost / invScaleFactor, 1), -1);

        // Need to consider here: the movement of the currently highest flavor
      } else {
        // Difference between highest flavor and the runner up that threatens to change the boosted meal power
        const dangerThreshold = Math.max(
          highestBoostAmount - secondHighestBoostAmount,
          1,
        );
        relPrimaryComponent =
          100 * Math.max(Math.min(ingPrimaryBoost / dangerThreshold, 1), -1);

        // Need to consider here: other flavors WITH secondHighestBoostAmount going up
      }

      if (secondaryFlavors.length === 0) return relPrimaryComponent;

      let halfRelSecondaryComponent: number;

      // foomoo: ingBoost, currentBoost
      const secondaryMatch = secondaryFlavors.some(
        (f) => currentFlavorBoosts[f] === secondHighestBoostAmount,
      );

      // WE HAVE A FEW SCENARIOS TO CONSIDER
      // Secondary overshot => need to go down
      // Secondary undershot => need to go up
      // Secondary where it needs to be

      // other overshot primary
      // other overshot secondary but not primary

      // I think we need to preserve the primary/secondary here
      //

      if (secondHighestBoostAmount === 0 || !secondaryMatch) {
        const secondaryFlavorComponents = secondaryFlavors.reduce<number>(
          (sum, flavor) => {
            const ingBoost = ingredientFlavorBoosts[flavor] || 0;
            const currentBoost = currentFlavorBoosts[flavor] || 0;

            // Flavor needed to achieve desired power boost
            // Assumption: needed > 0
            const needed = secondHighestBoostAmount - currentBoost + 1;

            const invScaleFactor = Math.max(
              needed,
              needed - absSecondaryComponent,
            );
            const component = Math.max(
              Math.min((absSecondaryComponent * 50) / invScaleFactor, 50),
              -50,
            );
            return sum + component;
          },
          0,
        );

        halfRelSecondaryComponent =
          secondaryFlavorComponents / secondaryFlavors.length;

        // Need to consider here
      } else {
        // Difference between highest flavor and the runner up that threatens to change the boosted meal power
        const oneTwo = highestBoostAmount - secondHighestBoostAmount;
        const twoThree = secondHighestBoostAmount - thirdHighestBoostAmount;
        const dangerThreshold =
          highestBoostedFlavor === primaryFlavor && oneTwo > twoThree
            ? Math.min(-oneTwo, -1)
            : Math.max(twoThree, 1);
        halfRelSecondaryComponent = Math.max(
          Math.min((absSecondaryComponent * 50) / dangerThreshold, 50),
          -50,
        );
      }
      if (i === 0)
        console.debug({
          relPrimaryComponent,
          relSecondaryComponent: 2 * halfRelSecondaryComponent,
        });
      return relPrimaryComponent / 2 + halfRelSecondaryComponent;
    });
  };
})();
