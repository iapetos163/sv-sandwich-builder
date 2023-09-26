import { Ingredient, ResultPower } from '@/types';
import { add, scale } from '@/vector-math';
import { evaluateBoosts, isHerbaMealPower } from './powers';
import { getBoostedMealPower, rankFlavorBoosts } from './taste';

export const getPowersForIngredients = (
  ingredients: Ingredient[],
  pieceDrops: Record<string, number>,
): ResultPower[] => {
  const init = {
    mealPowerBoosts: [] as number[],
    typeBoosts: [] as number[],
    flavorBoosts: [] as number[],
  };

  const totalFillingPieces = ingredients
    .filter((i) => i.ingredientType === 'filling')
    .reduce((sum, ing) => sum + ing.pieces, 0);
  const allowedDrops = Math.floor(totalFillingPieces / 2);
  const totalDrops = Object.values(pieceDrops).reduce((sum, v) => sum + v, 0);
  // TODO: handle two stars
  if (totalDrops > allowedDrops) {
    return [];
  }

  const ingredientsWithDrops = ingredients.concat(
    Object.entries(pieceDrops).map(([id, numDropped]) => ({
      ...ingredients.find((i) => i.id === id)!,
      pieces: -numDropped,
    })),
  );

  const { mealPowerBoosts, typeBoosts, flavorBoosts } =
    ingredientsWithDrops.reduce(
      ({ mealPowerBoosts, typeBoosts, flavorBoosts }, ingredient) => ({
        mealPowerBoosts: scale(
          add(mealPowerBoosts, ingredient.baseMealPowerVector),
          ingredient.pieces,
        ),
        typeBoosts: scale(
          add(typeBoosts, ingredient.typeVector),
          ingredient.pieces,
        ),
        flavorBoosts: scale(
          add(flavorBoosts, ingredient.flavorVector),
          ingredient.pieces,
        ),
      }),
      init,
    );

  const rankedFlavorBoosts = rankFlavorBoosts(flavorBoosts);
  const boostedPower = getBoostedMealPower(rankedFlavorBoosts);
  const powers = evaluateBoosts(mealPowerBoosts, boostedPower, typeBoosts);
  if (ingredients.some(({ id }) => id === 'hmany')) {
    return powers.map(({ mealPower, ...power }) =>
      isHerbaMealPower(mealPower) ? { mealPower, ...power } : power,
    );
  }
  return powers;
};
