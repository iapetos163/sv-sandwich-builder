import { Flavor, MealPower, rangeMealPowers, rangeFlavors } from '../../enum';
import { FlavorBoost, rankFlavorBoosts } from '../../mechanics';

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

export interface RelativeTasteVectorProps {
  currentFlavorVector: number[];
  ingredientFlavorVector: number[];
}

/**
 * Takes the sum of two numbers,
 * scales that by 100,
 * and clamps that between -100 and 100.
 */
const sumScaleClamp = (n1: number, n2: number) =>
  100 * Math.max(Math.min(n1 + n2, 1), -1);

export const getRelativeTasteVector = (() => {
  const flavorBoostsLookup: Partial<Record<string, FlavorBoost[]>> = {};
  const memoRankFlavorBoosts = (flavorVector: number[]) => {
    const key = rangeFlavors.map((f) => String(flavorVector[f] ?? 0)).join(',');
    const memoized = flavorBoostsLookup[key];
    if (memoized) return memoized;
    const res = rankFlavorBoosts(flavorVector);
    flavorBoostsLookup[key] = res;
    return res;
  };

  return ({
    currentFlavorVector,
    ingredientFlavorVector,
  }: RelativeTasteVectorProps) => {
    const currentRankedFlavorBoosts = memoRankFlavorBoosts(currentFlavorVector);

    const highestBoostAmount = currentRankedFlavorBoosts[0]?.amount || 0;
    const highestBoostFlavor = currentRankedFlavorBoosts[0]?.flavor;
    const secondHighestBoostAmount = currentRankedFlavorBoosts[1]?.amount || 0;

    return rangeMealPowers.map((mp) => {
      const primaryFlavors = primaryFlavorsForPower[mp];
      const secondaryFlavors = secondaryFlavorsForPower[mp];
      const numPrimary = primaryFlavors.length;
      const numSecondary = secondaryFlavors.length;
      const numTotal = numPrimary + numSecondary;
      if (numPrimary === 0) return 0;

      const nonPrimaryFlavors = rangeFlavors.filter(
        (f) => !primaryFlavors.includes(f),
      );
      const otherFlavors = nonPrimaryFlavors.filter(
        (f) => !secondaryFlavors.includes(f),
      );

      const primaryFirstMatch = primaryFlavors.find(
        (f) => f === highestBoostFlavor,
      );

      if (highestBoostAmount === 0) {
        const highestBoostForOther = Math.max(
          ...otherFlavors
            .filter((f) => (currentFlavorVector[f] || 0) >= highestBoostAmount)
            .map((f) => ingredientFlavorVector[f] || 0),
        );
        const primaryComponents = primaryFlavors.map((f) => {
          const ingBoost = ingredientFlavorVector[f] || 0;
          return (ingBoost - highestBoostForOther / 2) / Math.max(ingBoost, 1);
        });
        const secondaryComponents = secondaryFlavors.map((f) => {
          const ingBoost = ingredientFlavorVector[f] || 0;
          return (ingBoost - highestBoostForOther / 2) / Math.max(ingBoost, 1);
        });

        return sumScaleClamp(
          (numSecondary * Math.max(...primaryComponents)) / numTotal,
          (numPrimary * Math.max(...secondaryComponents)) / numTotal,
        );
      }

      // Delicate case to consider here:
      // If primary != secondary and two are tied
      // We think we're defending but we aren't
      if (!primaryFirstMatch) {
        const secondaryFirstMatches = secondaryFlavors.filter(
          (f) => (currentFlavorVector[f] || 0) >= highestBoostAmount,
        );

        const otherFlavorsBelowHighest = otherFlavors.filter(
          (f) => (currentFlavorVector[f] || 0) < highestBoostAmount,
        );

        const highestBoostForCurrentNonprimaryHighest = Math.max(
          ...nonPrimaryFlavors
            .filter((f) => (currentFlavorVector[f] || 0) >= highestBoostAmount)
            .map((f) => ingredientFlavorVector[f] || 0),
        );

        const primaryComponents = primaryFlavors.map((f) => {
          const ingBoost = ingredientFlavorVector[f] || 0;
          const currentBoost = currentFlavorVector[f] || 0;

          const targetHighestBoost = Math.max(
            currentBoost + 1,
            highestBoostAmount,
          );
          return (
            (ingBoost - highestBoostForCurrentNonprimaryHighest) /
            Math.max(targetHighestBoost - currentBoost, ingBoost, 1)
          );
        });
        if (secondaryFirstMatches.length === 0) {
          // offensive on primary, toward highestBoostAmount
          // offensive on secondary, toward highestBoostAmount
          // primary supporters: primaries
          // secondary supporters: secondaries
          // primary detractors: others >= highestBoostAmount
          // secondary detractors: others < highestBoostAmount

          const others2 = Math.max(
            ...otherFlavorsBelowHighest.map(
              (f) => ingredientFlavorVector[f] || 0,
            ),
          );

          const secondaryComponents = secondaryFlavors.map((f) => {
            const ingBoost = ingredientFlavorVector[f] || 0;
            const currentBoost = currentFlavorVector[f] || 0;
            return (
              (ingBoost - others2) /
              Math.max(highestBoostAmount - currentBoost, ingBoost, 1)
            );
          });

          return sumScaleClamp(
            (numSecondary * Math.max(...primaryComponents)) / numTotal,
            (numPrimary * Math.max(...secondaryComponents)) / numTotal,
          );
        }
        // offensive on primary, toward highestBoostAmount
        // defensive on nonPrimary secondary, from highestBoostAmount
        // primary supporters: primaries
        // primary detractors: nonprimaries >= highestBoostAmount
        // secondary detractors: others < highestBoostAmount
        // neutral: secondary < highestBoostAmount

        const otherToHighest = otherFlavorsBelowHighest.map((f) => {
          const ingBoost = ingredientFlavorVector[f] || 0;
          const currentBoost = currentFlavorVector[f] || 0;
          return (
            ingBoost / Math.max(highestBoostAmount - currentBoost, ingBoost, 1)
          );
        });

        // if (i === 7)
        //   console.debug({
        //     primary: Math.max(...primaryComponents),
        //     secondary: -Math.max(...otherToHighest),
        //   });

        return sumScaleClamp(
          (numSecondary * Math.max(...primaryComponents)) / numTotal,
          (numPrimary * -Math.max(...otherToHighest)) / numTotal,
        );
      }

      /*
      Established:
      * highestBoostAmount > 0
      * primaryFirstMatches.length > 0
      */
      const secondarySecondMatches = secondaryFlavors.filter(
        (f) => (currentFlavorVector[f] || 0) === secondHighestBoostAmount,
      );

      const nonPrimariesFromSecondToHighest = nonPrimaryFlavors
        .filter(
          (f) => (currentFlavorVector[f] || 0) >= secondHighestBoostAmount,
        )
        .map((f) => {
          const ingBoost = ingredientFlavorVector[f] || 0;
          const currentBoost = currentFlavorVector[f] || 0;
          return (
            ingBoost / Math.max(highestBoostAmount - currentBoost, ingBoost, 1)
          );
        });

      const othersToSecond = otherFlavors
        .filter((f) => (currentFlavorVector[f] || 0) < secondHighestBoostAmount)
        .map((f) => {
          const ingBoost = ingredientFlavorVector[f] || 0;
          const currentBoost = currentFlavorVector[f] || 0;
          return (
            ingBoost /
            Math.max(secondHighestBoostAmount - currentBoost, ingBoost, 1)
          );
        });

      if (
        secondHighestBoostAmount === 0 ||
        secondarySecondMatches.length === 0
      ) {
        // Whatever's on second isn't a primary
        // defensive on primary from highestBoostAmount
        // offensive on secondary toward secondHighestBoostAmount
        // secondary supporters: secondaries < secondHighestBoostAmount
        // primary detractors: nonprimaries >= secondHighestBoostAmount
        // Secondary detractors: others < secondHighestBoostAmount
        // neutral: primaries

        const secondariesToSecond = secondaryFlavors
          .filter(
            (f) => (currentFlavorVector[f] || 0) < secondHighestBoostAmount,
          )
          .map((f) => {
            const ingBoost = ingredientFlavorVector[f] || 0;
            const currentBoost = currentFlavorVector[f] || 0;
            return (
              ingBoost /
              Math.max(secondHighestBoostAmount - currentBoost, ingBoost, 1)
            );
          });

        return sumScaleClamp(
          (numSecondary * -Math.max(...nonPrimariesFromSecondToHighest, 0)) /
            numTotal,
          numPrimary * Math.max(...secondariesToSecond, 0) -
            Math.max(...othersToSecond, 0) / numTotal,
        );
      }

      /*
      Established:
      * highestBoostAmount > 0
      * secondHighestBoostAmount > 0
      * primaryFirstMatches.length > 0
      * secondarySecondMatches.length > 0
      */

      // defensive on primary from highestBoostAmount
      // defensive on secondary from secondHighestBoostAmount
      // primary detractors: nonprimaries >= secondHighestBoostAmount
      // secondary detractors: others < secondHighestBoostAmount
      // neutral: primaries, secondaries < secondHighestBoostAmount
      return sumScaleClamp(
        (numSecondary * -Math.max(...nonPrimariesFromSecondToHighest, 0)) /
          numTotal,
        (numPrimary * -Math.max(...othersToSecond, 0)) / numTotal,
      );
    });
  };
})();
