import { Flavor, flavors, MealPower, mealPowers } from '../strings';
import { add, scale } from '../vector-math';
import { addBoosts } from './powers';

interface FlavorBoost {
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

const powerFactors: Record<MealPower, number> = {
  Egg: 1,
  Humungo: 1,
  Teensy: 1,
  Item: 1,
  Encounter: 1,
  Catch: Math.SQRT1_2,
  Raid: Math.SQRT1_2,
  Exp: Math.SQRT1_2,
  Title: 0,
  Sparkling: 0,
};

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

export const tasteVectors: Record<Flavor, number[]> = {
  Sweet: mealPowers.map((mp) => {
    if (mp === 'Egg' || mp === 'Catch' || mp === 'Raid')
      return powerFactors[mp];
    if (mp === 'Humungo' || mp === 'Teensy') return -powerFactors[mp];
    return 0;
  }),
  Hot: mealPowers.map((mp) => {
    if (mp === 'Humungo' || mp === 'Raid') return powerFactors[mp];
    if (mp === 'Egg') return -powerFactors[mp];
    return 0;
  }),
  Bitter: mealPowers.map((mp) => {
    if (mp === 'Item' || mp === 'Exp') return powerFactors[mp];
    if (mp === 'Encounter') return -powerFactors[mp];
    return 0;
  }),
  Sour: mealPowers.map((mp) => {
    if (mp === 'Teensy' || mp === 'Catch') return powerFactors[mp];
    if (mp === 'Egg') return -powerFactors[mp];
    return 0;
  }),
  Salty: mealPowers.map((mp) => {
    if (mp === 'Encounter' || mp === 'Exp') return powerFactors[mp];
    if (mp === 'Item') return -powerFactors[mp];
    return 0;
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

const getTasteVector = (
  flavorBoosts: Partial<Record<Flavor, number>>,
  pieces: number,
) =>
  Object.entries(flavorBoosts).reduce<number[]>(
    (sum, [flavor, amount]) =>
      add(sum, scale(tasteVectors[flavor as Flavor], amount * pieces)),
    [],
  );

// Fixme: taste meal power vector depends on current flavor boosts
export const makeGetRelativeTasteVector = (
  flavorBoosts: Partial<Record<Flavor, number>>,
  rankedFlavorBoosts: FlavorBoost[],
  boostedPower: MealPower | null,
  targetPower: MealPower,
) => {
  const targetIndex = mealPowers.indexOf(targetPower);

  const highestFlavorBoostAmount = rankedFlavorBoosts[0]?.amount || 0;
  if (boostedPower !== targetPower) {
    // Flavor needed to achieve desired power boost
    const maxNeeded =
      highestFlavorBoostAmount -
      Math.min(
        ...componentFlavors[targetPower].map((f) => flavorBoosts[f] || 0),
      ) +
      1;

    return (
      ingFlavorBoosts: Partial<Record<Flavor, number>>,
      pieces: number,
    ) => {
      // const addedBoosts = addBoosts(flavorBoosts, ingFlavorBoosts, pieces);
      const tasteVector = getTasteVector(ingFlavorBoosts, pieces);
      const targetComponent = tasteVector[targetIndex] || 0;
      const invScaleFactor = Math.max(maxNeeded, Math.abs(targetComponent));
      if (invScaleFactor === 0) return tasteVector; //
      return scale(tasteVector, 100 / invScaleFactor);
    };
  }

  const runnerUpIndex = componentFlavors[targetPower].length;
  const runnerUpBoostAmount = rankedFlavorBoosts[runnerUpIndex]?.amount || 0;
  // Difference between highest flavor and the runner up that threatens to change the boosted meal power
  const dangerThreshold = Math.max(
    highestFlavorBoostAmount - runnerUpBoostAmount,
    1,
  );
  return (ingFlavorBoosts: Partial<Record<Flavor, number>>, pieces: number) => {
    const tasteVector = getTasteVector(ingFlavorBoosts, pieces);
    return mealPowers.map((mp, i) => {
      if (mp === targetPower) return 0;
      return tasteVector[i] ? (tasteVector[i] * 100) / dangerThreshold : 0;
    });
  };
};
