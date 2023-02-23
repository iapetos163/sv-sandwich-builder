import { createMetaVector } from '../src/metavector';

interface IngredientEntry {
  flavorVector: number[];
  baseMealPowerVector: number[];
  typeVector: number[];
}

const mpComponentWeight = (c: number) => Math.min(Math.abs(c), 21);
const typeComponentWeight = (c: number) => Math.min(Math.abs(c), 36);
const flavorComponentWeight = (c: number) => Math.min(Math.abs(c), 30);

export const createMatrix = (ingredients: IngredientEntry[]) => {
  return ingredients.map(
    ({ baseMealPowerVector, typeVector, flavorVector }, i) => {
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

      const totalWeight = totalMpWeight + totalTypeWeight + totalFlavorWeight;

      const mpPart = baseMealPowerVector.map((c) =>
        c !== 0 ? mpComponentWeight(c) / (c * totalWeight) : 0,
      );

      const typePart = typeVector.map((c) =>
        c !== 0 ? typeComponentWeight(c) / (c * totalWeight) : 0,
      );

      const flavorPart = flavorVector.map((c) =>
        c !== 0 ? flavorComponentWeight(c) / (c * totalWeight) : 0,
      );

      return createMetaVector({
        mealPowerVector: mpPart,
        typeVector: typePart,
        flavorVector: flavorPart,
      });
    },
  );
};
