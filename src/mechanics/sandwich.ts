import { Ingredient, ResultPower } from '@/types';
import { add } from '@/vector-math';
import { evaluateBoosts, isHerbaMealPower } from './powers';
import { getBoostedMealPower, rankFlavorBoosts } from './taste';

export const getPowersForIngredients = (
  ingredients: Ingredient[],
): ResultPower[] => {
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
  const powers = evaluateBoosts(mealPowerBoosts, boostedPower, typeBoosts);
  if (ingredients.some(({ id }) => id === 'hmany')) {
    return powers.map(({ mealPower, ...power }) =>
      isHerbaMealPower(mealPower) ? { mealPower, ...power } : power,
    );
  }
  return powers;
};
