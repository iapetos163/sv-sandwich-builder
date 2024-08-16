import { Ingredient, ResultPower } from '@/types';
import { add, scale } from '@/vector-math';
import { evaluateBoosts, isHerbaMealPower } from './powers';
import { getBoostedMealPower, rankFlavorBoosts } from './taste';

export interface PowersForIngredientsRes {
  powers: ResultPower[];
  stars: number;
}

export const getPowersForIngredients = (
  ingredients: Ingredient[],
  pieceDrops: Record<string, number>,
): PowersForIngredientsRes => {
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
  if (totalDrops === totalFillingPieces) {
    return { powers: [], stars: 0 };
  }
  const twoStars = totalDrops > allowedDrops;

  const ingredientsWithDrops = ingredients.concat(
    Object.entries(pieceDrops).map(([id, numDropped]) => ({
      ...ingredients.find((i) => i.id === id)!,
      pieces: -numDropped,
    })),
  );

  const { mealPowerBoosts, typeBoosts, flavorBoosts } =
    ingredientsWithDrops.reduce(
      ({ mealPowerBoosts, typeBoosts, flavorBoosts }, ingredient) => ({
        mealPowerBoosts: add(
          mealPowerBoosts,
          scale(ingredient.baseMealPowerVector, ingredient.pieces),
        ),
        typeBoosts: add(
          typeBoosts,
          scale(ingredient.typeVector, ingredient.pieces),
        ),
        flavorBoosts: add(
          flavorBoosts,
          scale(ingredient.flavorVector, ingredient.pieces),
        ),
      }),
      init,
    );

  const rankedFlavorBoosts = rankFlavorBoosts(flavorBoosts);
  const boostedPower = getBoostedMealPower(rankedFlavorBoosts);
  let powers: ResultPower[] = evaluateBoosts(
    mealPowerBoosts,
    boostedPower,
    typeBoosts,
    twoStars,
  );
  if (ingredients.some(({ id }) => id === 'hmany')) {
    powers = powers.map(({ mealPower, ...power }) =>
      isHerbaMealPower(mealPower!) ? { mealPower, ...power } : power,
    );
  }
  return { powers, stars: twoStars ? 2 : 3 };
};
