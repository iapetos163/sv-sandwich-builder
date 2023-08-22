import { Ingredient } from '@/types';
import { add } from '@/vector-math';
import { evaluateBoosts } from './powers';
import { getBoostedMealPower, rankFlavorBoosts } from './taste';

export const getPowersForIngredients = (ingredients: Ingredient[]) => {
  const init = {
    mealPowerBoosts: [] as number[],
    typeBoosts: [] as number[],
    flavorBoosts: [] as number[],
  };

  const { mealPowerBoosts, typeBoosts, flavorBoosts } = ingredients.reduce(
    ({ mealPowerBoosts, typeBoosts, flavorBoosts }, ingredient) => ({
      mealPowerBoosts: add(mealPowerBoosts, ingredient.baseMealPowerVector),
      typeBoosts: add(typeBoosts, ingredient.typeVector),
      flavorBoosts: add(flavorBoosts, ingredient.flavorVector),
    }),
    init,
  );

  const rankedFlavorBoosts = rankFlavorBoosts(flavorBoosts);
  const boostedPower = getBoostedMealPower(rankedFlavorBoosts);
  return evaluateBoosts(mealPowerBoosts, boostedPower, typeBoosts);
};
