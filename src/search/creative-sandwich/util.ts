import type { SandwichResult } from '.';

type Accum = { bIds: string[]; isSubset: boolean };

/**
 * Return true if the ingredients of `a` form a subset of the ingredients of `b`
 */
export const sandwichIsSubset = (a: SandwichResult, b: SandwichResult) => {
  const aIngredientIds = a.condiments.concat(a.fillings).map(({ id }) => id);
  const bIngredientIds = b.condiments.concat(b.fillings).map(({ id }) => id);
  const { isSubset } = aIngredientIds.reduce<Accum>(
    ({ bIds, isSubset }, aId) => {
      if (!isSubset) return { bIds, isSubset };

      const matchingBNameIndex = bIds.findIndex((bId) => bId === aId);
      if (matchingBNameIndex >= 0) {
        bIds.splice(matchingBNameIndex, 1);
        return { isSubset: true, bIds };
      }
      return { isSubset: false, bIds };
    },
    {
      bIds: bIngredientIds,
      isSubset: true,
    },
  );
  return isSubset;
};
