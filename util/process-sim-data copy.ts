import { createMetaVector } from '../src/metavector';
import { IngredientEntry } from './process-sim-data';

const mpComponentWeight = (c: number) => Math.max(Math.abs(c), 21);
const typeComponentWeight = (c: number) => Math.max(Math.abs(c), 36);
const flavorComponentWeight = (c: number) => Math.max(Math.abs(c), 30);

export const main = (ingredients: IngredientEntry[]) => {
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
        (c) => (c < 0 ? -1 : 1) * mpComponentWeight(c) * adjustment,
      );

      const typePart = typeVector.map(
        (c) => (c < 0 ? -1 : 1) * typeComponentWeight(c) * adjustment,
      );

      const flavorPart = flavorVector.map(
        (c) => flavorComponentWeight(c) * adjustment,
      );

      return createMetaVector({
        mealPowerVector: mpPart,
        typeVector: typePart,
        flavorVector: flavorPart,
      });
    },
  );
};
