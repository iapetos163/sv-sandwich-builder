import { Flavor, flavors, MealPower, mealPowers } from '../strings';
import { scale } from '../vector-math';

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
        (va || 0) - (vb || 0) ||
        flavors.indexOf(fa as Flavor) - flavors.indexOf(fb as Flavor),
    )
    .map(([f, v]) => ({ name: f as Flavor, amount: v || 0 }));

export const makeGetRelativeTasteVector = (
  flavorBoosts: Partial<Record<Flavor, number>>,
  rankedFlavorBoosts: FlavorBoost[],
  boostedPower: MealPower | null,
  targetPower: MealPower,
) => {
  const targetIndex = mealPowers.indexOf(targetPower);
  if (!boostedPower) {
    return (tasteVector: number[]) => {
      const targetComponent = tasteVector[targetIndex] || 0;
      if (targetComponent === 0) return tasteVector;
      const scaleFactor = Math.abs(100 / targetComponent);
      return scale(tasteVector, scaleFactor);
    };
  }
  if (boostedPower !== targetPower) {
    // Flavor needed to achieve desired power boost
    const maxNeeded =
      rankedFlavorBoosts[0].amount -
      Math.min(
        ...componentFlavors[targetPower].map((f) => flavorBoosts[f] || 0),
      );

    return (tasteVector: number[]) => {
      const targetComponent = tasteVector[targetIndex] || 0;
      const invScaleFactor = Math.max(maxNeeded, Math.abs(targetComponent));
      if (invScaleFactor === 0) return tasteVector;
      return scale(tasteVector, 100 / invScaleFactor);
    };
  }

  // Difference between highest flavor and the runner up that threatens to change the boosted meal power
  const dangerThreshold =
    rankedFlavorBoosts[0].amount -
    (rankedFlavorBoosts[componentFlavors[targetPower].length]?.amount || 0);
  return (tasteVector: number[]) =>
    mealPowers.map((mp, i) => {
      if (mp === targetPower) return 0;
      return tasteVector[i] ? (tasteVector[i] * 100) / dangerThreshold : 0;
    });
};
