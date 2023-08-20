import { rangeFlavors } from '../src/enum';
import { IngredientEntry } from './process-sim-data';

const getPiecesConstraints = (ingredients: IngredientEntry[], limit: number) =>
  Object.fromEntries(
    ingredients
      .filter((i) => i.pieces > 2)
      .map((i) => [i.name, { max: Math.floor(limit / i.pieces) }]),
  );

export const generateLinearVariables = (ingredients: IngredientEntry[]) => {
  return {
    constraints: {
      multiplayerPieces: getPiecesConstraints(ingredients, 15),
      singlePlayerPieces: getPiecesConstraints(ingredients, 12),
    },
    variables: {
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
