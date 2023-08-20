import { rangeFlavors } from '../src/enum';
import { IngredientEntry } from './process-sim-data';

const getPiecesConstraints = (ingredients: IngredientEntry[], limit: number) =>
  Object.fromEntries(
    ingredients
      .filter((i) => i.pieces > 2)
      .map((i) => [i.name, { max: Math.floor(limit / i.pieces) }]),
  );

export const generateLinearVariables = (ingredients: IngredientEntry[]) => {
  const variables = {
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
    score: Object.fromEntries(
      ingredients.map((ing) => [
        ing.name,
        ing.ingredientType === 'filling' ? 5 : ing.isHerbaMystica ? 35 : 1,
      ]),
    ),
  };

  return {
    constraints: {
      multiplayerPieces: getPiecesConstraints(ingredients, 15),
      singlePlayerPieces: getPiecesConstraints(ingredients, 12),
    },
    variables,
    variableSets: {
      flavorValueDifferences: rangeFlavors.map((fa) =>
        rangeFlavors.map((fb) =>
          fa === fb
            ? {}
            : Object.fromEntries(
                ingredients
                  .map(({ name, flavorVector }) => [
                    name,
                    flavorVector[fa] - flavorVector[fb],
                  ])
                  .filter(([, v]) => v !== 0),
              ),
        ),
      ),
    },
  };
};
