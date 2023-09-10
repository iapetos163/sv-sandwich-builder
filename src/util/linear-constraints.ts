import { MealPower, rangeFlavors, rangeMealPowers, rangeTypes } from '@/enum';
import { LinearConstraints } from '@/types';
import { IngredientEntry } from './process-sim-data';

const getPiecesConstraints = (ingredients: IngredientEntry[], limit: number) =>
  ingredients
    .filter((i) => i.pieces > 2)
    .map((i) => ({
      coefficients: { [i.name]: 1 },
      upperBound: Math.floor(limit / i.pieces),
    }));

export const generateLinearConstraints = (
  ingredients: IngredientEntry[],
): LinearConstraints => ({
  objective: {
    direction: 'min',
    coefficients: Object.fromEntries(
      ingredients.map((ing) => [
        ing.name,
        ing.ingredientType === 'filling' ? 5 : 1,
      ]),
    ),
  },
  constraintSets: {
    multiplayerPieces: getPiecesConstraints(ingredients, 15),
    singlePlayerPieces: getPiecesConstraints(ingredients, 12),

    flavorValueDifferences: rangeFlavors.map((fa) =>
      rangeFlavors.map((fb) =>
        fa === fb
          ? { coefficients: {}, lowerBound: 0 }
          : {
              name: `F${fa}-F${fb}`,
              coefficients: Object.fromEntries(
                ingredients
                  .map(({ name, flavorVector }) => [
                    name,
                    flavorVector[fa] - flavorVector[fb],
                  ])
                  .filter(([, v]) => v !== 0),
              ),
              lowerBound: fa > fb ? 1 : 0,
            },
      ),
    ),
    mealPowerValueDifferences: rangeMealPowers.map((mpa) =>
      rangeMealPowers.map((mpb) =>
        mpa === mpb
          ? { coefficients: {}, lowerBound: 0 }
          : {
              name: `MP${mpa}-MP${mpb}`,
              coefficients: Object.fromEntries(
                ingredients
                  .map(({ name, baseMealPowerVector }) => [
                    name,
                    baseMealPowerVector[mpa] - baseMealPowerVector[mpb],
                  ])
                  .filter(([, v]) => v !== 0),
              ),
              lowerBound: mpa > mpb ? 1 : 0,
            },
      ),
    ),
    typeValueDifferences: rangeTypes.map((ta) =>
      rangeTypes.map((tb) =>
        ta === tb
          ? { coefficients: {}, lowerBound: 0 }
          : {
              name: `T${ta}-T${tb}`,
              coefficients: Object.fromEntries(
                ingredients
                  .map(({ name, typeVector }) => [
                    name,
                    typeVector[ta] - typeVector[tb],
                  ])
                  .filter(([, v]) => v !== 0),
              ),
              lowerBound: ta > tb ? 1 : 0,
            },
      ),
    ),
    typeDiff70: rangeTypes.map((ta) =>
      rangeTypes.map((tb) =>
        ta === tb
          ? { coefficients: {}, lowerBound: 0 }
          : {
              name: `T${ta}-1.5T${tb}>=70`,
              coefficients: Object.fromEntries(
                ingredients
                  .map(({ name, typeVector }) => [
                    name,
                    typeVector[ta] - 1.5 * typeVector[tb],
                  ])
                  .filter(([, v]) => v !== 0),
              ),
              lowerBound: 70,
            },
      ),
    ),
    typeDiff105: rangeTypes.map((ta) =>
      rangeTypes.map((tb) =>
        ta === tb
          ? { coefficients: {}, lowerBound: 0 }
          : {
              name: `T${ta}-${tb}>105`,
              coefficients: Object.fromEntries(
                ingredients
                  .map(({ name, typeVector }) => [
                    name,
                    typeVector[ta] - typeVector[tb],
                  ])
                  .filter(([, v]) => v !== 0),
              ),
              lowerBound: 106,
            },
      ),
    ),
  },
  coefficientSets: {
    fillings: Object.fromEntries(
      ingredients
        .filter((i) => i.ingredientType === 'filling')
        .map((i) => i.name)
        .map((n) => [n, 1]),
    ),
    condiments: Object.fromEntries(
      ingredients
        .filter((i) => i.ingredientType === 'condiment')
        .map((i) => i.name)
        .map((n) => [n, 1]),
    ),
    herba: Object.fromEntries(
      ingredients
        .filter((i) => i.isHerbaMystica)
        .map((i) => i.name)
        .map((n) => [n, 1]),
    ),
    typeValues: rangeTypes.map((t) =>
      Object.fromEntries(
        ingredients
          .map(({ name, typeVector }) => [name, typeVector[t]])
          .filter(([, v]) => v !== 0),
      ),
    ),
  },
  constraints: {
    herbaMealPowerValue: {
      coefficients: Object.fromEntries(
        ingredients
          .filter((i) => i.isHerbaMystica)
          .map((i) => [i.name, i.baseMealPowerVector[MealPower.SPARKLING]]),
      ),
      lowerBound: 1,
    },
  },
});
