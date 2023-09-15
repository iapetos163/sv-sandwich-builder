import { MealPower, rangeFlavors, rangeMealPowers, rangeTypes } from '@/enum';
import { LinearConstraints, Ingredient } from '@/types';

const getPiecesConstraints = (ingredients: Ingredient[], limit: number) =>
  ingredients
    .filter((i) => i.pieces > 2)
    .map((i) => ({
      coefficients: { [i.id]: 1 },
      upperBound: Math.floor(limit / i.pieces),
    }));

export const generateLinearConstraints = (
  ingredients: Ingredient[],
): LinearConstraints => ({
  objective: {
    direction: 'min',
    coefficients: Object.fromEntries(
      ingredients.map((ing) => [
        ing.id,
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
                  .map(({ id, flavorVector }) => [
                    id,
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
                  .map(({ id, baseMealPowerVector }) => [
                    id,
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
                  .map(({ id, typeVector }) => [
                    id,
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
                  .map(({ id, typeVector }) => [
                    id,
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
                  .map(({ id, typeVector }) => [
                    id,
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
        .map((i) => i.id)
        .map((n) => [n, 1]),
    ),
    condiments: Object.fromEntries(
      ingredients
        .filter((i) => i.ingredientType === 'condiment')
        .map((i) => i.id)
        .map((n) => [n, 1]),
    ),
    herba: Object.fromEntries(
      ingredients
        .filter((i) => i.isHerbaMystica)
        .map((i) => i.id)
        .map((n) => [n, 1]),
    ),
    typeValues: rangeTypes.map((t) =>
      Object.fromEntries(
        ingredients
          .map(({ id, typeVector }) => [id, typeVector[t]])
          .filter(([, v]) => v !== 0),
      ),
    ),
  },
  constraints: {
    herbaMealPowerValue: {
      coefficients: Object.fromEntries(
        ingredients
          .filter((i) => i.isHerbaMystica)
          .map((i) => [i.id, i.baseMealPowerVector[MealPower.SPARKLING]]),
      ),
      lowerBound: 1,
    },
  },
});
