import { Flavor, flavors, MealPower, mealPowers } from '../strings';
import { add, scale } from '../vector-math';
import { boostsEqual } from './boost';

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

export const secondaryTasteVectors: Record<Flavor, number[]> = {
  Sweet: mealPowers.map((mp) => {
    switch (mp) {
      case 'Egg':
      case 'Catch':
      case 'Raid':
      case 'Title':
      case 'Sparkling':
        return 0;
    }
    return 0;
  }),
  Hot: mealPowers.map((mp) => {
    switch (mp) {
      case 'Humungo':
        return 1;
      case 'Title':
      case 'Sparkling':
        return 0;
    }
    return -1;
  }),
  Bitter: mealPowers.map((mp) => {
    switch (mp) {
      case 'Item':
      case 'Exp':
        return 1;
      case 'Title':
      case 'Sparkling':
        return 0;
    }
    return -1;
  }),
  Sour: mealPowers.map((mp) => {
    switch (mp) {
      case 'Teensy':
        return 1;
      case 'Title':
      case 'Sparkling':
        return 0;
    }
    return -1;
  }),
  Salty: mealPowers.map((mp) => {
    switch (mp) {
      case 'Encounter':
        return 1;
      case 'Title':
      case 'Sparkling':
        return 0;
    }
    return -1;
  }),
};

export const primaryTasteVectors: Record<Flavor, number[]> = {
  Sweet: mealPowers.map((mp) => {
    switch (mp) {
      case 'Egg':
      case 'Catch':
      case 'Raid':
        return 1;
      case 'Title':
      case 'Sparkling':
        return 0;
    }
    return -1;
  }),
  Hot: mealPowers.map((mp) => {
    switch (mp) {
      case 'Humungo':
        return 1;
      case 'Title':
      case 'Sparkling':
        return 0;
    }
    return -1;
  }),
  Bitter: mealPowers.map((mp) => {
    switch (mp) {
      case 'Item':
      case 'Exp':
        return 1;
      case 'Title':
      case 'Sparkling':
        return 0;
    }
    return -1;
  }),
  Sour: mealPowers.map((mp) => {
    switch (mp) {
      case 'Teensy':
        return 1;
      case 'Title':
      case 'Sparkling':
        return 0;
    }
    return -1;
  }),
  Salty: mealPowers.map((mp) => {
    switch (mp) {
      case 'Encounter':
        return 1;
      case 'Title':
      case 'Sparkling':
        return 0;
    }
    return -1;
  }),
};

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
  currentFlavorBoosts: Partial<Record<Flavor, number>>;
  primaryTasteVector: number[];
  secondaryTasteVector: number[];
  targetPower: MealPower;
}

export const getRelativeTasteVector = (() => {
  // todo: memoize by currentFlavorBoosts, currentRankedFlavorBoosts, boostedPower, targetPower
  // memoize independently: ing

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
    targetPower,
    primaryTasteVector,
    secondaryTasteVector,
  }: RelativeTasteVectorProps) => {
    const primaryFlavor = primaryFlavorsForPower[targetPower];
    const secondaryFlavors = secondaryFlavorsForPower[targetPower];
    if (!primaryFlavor) return [];

    const currentRankedFlavorBoosts = memoRankFlavorBoosts(currentFlavorBoosts);
    const targetIndex = mealPowers.indexOf(targetPower);

    const highestBoostAmount = currentRankedFlavorBoosts[0]?.amount || 0;
    const highestBoostedFlavor = currentRankedFlavorBoosts[0]?.name;
    const secondHighestBoostAmount = currentRankedFlavorBoosts[1]?.amount || 0;
    const secondHighestBoostedFlavor = currentRankedFlavorBoosts[1]?.name;
    const thirdHighestBoostAmount = currentRankedFlavorBoosts[2]?.amount || 0;

    let primaryVector: number[];
    if (highestBoostedFlavor !== primaryFlavor) {
      // Flavor needed to achieve desired power boost
      // Assumption: needed > 0
      const needed =
        highestBoostAmount - (currentFlavorBoosts[primaryFlavor] || 0) + 1;

      const targetComponent = primaryTasteVector[targetIndex] || 0;
      const invScaleFactor = Math.max(needed, needed - targetComponent);
      primaryVector = scale(primaryTasteVector, 100 / invScaleFactor);
    } else {
      // Difference between highest flavor and the runner up that threatens to change the boosted meal power
      const dangerThreshold = Math.max(
        highestBoostAmount - secondHighestBoostAmount,
        1,
      );
      primaryVector = mealPowers.map((mp, i) => {
        if (mp === targetPower) return 0;
        return primaryTasteVector[i]
          ? (primaryTasteVector[i] * 100) / dangerThreshold
          : 0;
      });
    }

    if (secondaryFlavors.length === 0) return primaryVector;

    let halfSecondaryVector: number[];
    if (!flavors.includes(secondHighestBoostedFlavor)) {
      const flavorSum = flavors.reduce<number[]>((sum, flavor) => {
        // Flavor needed to achieve desired power boost
        // Assumption: needed > 0
        const needed =
          secondHighestBoostAmount - (currentFlavorBoosts[flavor] || 0) + 1;

        const targetComponent = secondaryTasteVector[targetIndex] || 0;
        const invScaleFactor = Math.max(needed, needed - targetComponent);
        const tasteVector = scale(secondaryTasteVector, 50 / invScaleFactor);
        return add(sum, tasteVector);
      }, []);

      halfSecondaryVector = scale(flavorSum, 1 / flavors.length);
    } else {
      // Difference between highest flavor and the runner up that threatens to change the boosted meal power
      const dangerThreshold = Math.max(
        Math.min(
          highestBoostAmount - secondHighestBoostAmount,
          secondHighestBoostAmount - thirdHighestBoostAmount,
        ),
        1,
      );
      halfSecondaryVector = mealPowers.map((mp, i) => {
        if (mp === targetPower) return 0;
        return secondaryTasteVector[i]
          ? (secondaryTasteVector[i] * 50) / dangerThreshold
          : 0;
      });
    }

    return add(scale(primaryVector, 0.5), halfSecondaryVector);
  };
})();
