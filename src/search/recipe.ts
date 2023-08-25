import { recipes } from '../data';
import { powerSetsMatch } from '../mechanics';
import { Power, SandwichRecipe } from '../types';

export const getRecipeForPowers = (targetPowers: Power[]) => {
  const [optimalRecipe] = recipes.reduce<[SandwichRecipe | null, number]>(
    ([optimal, lowestScore], recipe) => {
      if (!powerSetsMatch(recipe.powers, targetPowers)) {
        return [optimal, lowestScore];
      }

      const score =
        35 * recipe.condiments.filter((c) => c.isHerbaMystica).length +
        5 * recipe.fillings.length +
        recipe.condiments.length;

      if (score < lowestScore) {
        return [recipe, score];
      }
      return [optimal, lowestScore];
    },
    [null, Infinity],
  );

  return optimalRecipe;
};
