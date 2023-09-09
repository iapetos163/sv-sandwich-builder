import type { SandwichResult } from '.';

type Accum = { bNames: string[]; isSubset: boolean };

/**
 * Return true if the ingredients of `a` form a subset of the ingredients of `b`
 */
export const sandwichIsSubset = (a: SandwichResult, b: SandwichResult) => {
  const aIngredientNames = a.condiments
    .concat(a.fillings)
    .map(({ name }) => name);
  const bIngredientNames = b.condiments
    .concat(b.fillings)
    .map(({ name }) => name);
  const { isSubset } = aIngredientNames.reduce<Accum>(
    ({ bNames, isSubset }, aName) => {
      if (!isSubset) return { bNames, isSubset };

      const matchingBNameIndex = bNames.findIndex((bName) => bName === aName);
      if (matchingBNameIndex >= 0) {
        bNames.splice(matchingBNameIndex, 1);
        return { isSubset: true, bNames };
      }
      return { isSubset: false, bNames };
    },
    {
      bNames: bIngredientNames,
      isSubset: true,
    },
  );
  return isSubset;
};
