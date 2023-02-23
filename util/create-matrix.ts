import { createMetaVector } from '../src/metavector';

interface IngredientEntry {
  flavorVector: number[];
  baseMealPowerVector: number[];
  typeVector: number[];
  metaVector: number[];
}

const mpComponentWeight = (c: number) => Math.max(Math.abs(c), 21);
const typeComponentWeight = (c: number) => Math.max(Math.abs(c), 36);
const flavorComponentWeight = (c: number) => Math.max(Math.abs(c), 30);

export const createMatrix = (ingredients: IngredientEntry[]) => {
  return ingredients.map(
    ({ baseMealPowerVector, typeVector, flavorVector, metaVector }) => {
      const totalMpWeight = baseMealPowerVector.reduce(
        (sum, c) => sum + mpComponentWeight(c),
        0,
      );
      const totalTypeWeight = typeVector.reduce(
        (sum, c) => sum + typeComponentWeight(c),
        0,
      );
      const totalFlavorWeight = flavorVector.reduce(
        (sum, c) => sum + flavorComponentWeight(c),
        0,
      );
      const componentAbsSum = metaVector.reduce(
        (sum, c) => sum + Math.abs(c),
        0,
      );

      const adjustment = totalFlavorWeight / componentAbsSum;

      // TODO which one of these is right
      const mpPart = baseMealPowerVector.map(
        (c) => ((c < 0 ? -1 : 1) * mpComponentWeight(c)) / componentAbsSum,
      );

      const typePart = typeVector.map(
        (c) => ((c < 0 ? -1 : 1) * typeComponentWeight(c)) / componentAbsSum,
      );

      const flavorPart = flavorVector.map(
        (c) => ((c < 0 ? -1 : 1) * flavorComponentWeight(c)) / componentAbsSum,
      );

      return createMetaVector({
        mealPowerVector: mpPart,
        typeVector: typePart,
        flavorVector: flavorPart,
      });
    },
  );
};
