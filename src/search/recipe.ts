import { recipes } from '@/data';
import { powerSetsMatch } from '@/mechanics';
import { Power, SandwichRecipe } from '@/types';

const RESULT_LIMIT = 2;
const SCORE_THRESHOLD = 9;

export const getRecipesForPowers = (
  targetPowers: Power[],
): SandwichRecipe[] => {
  const matchingRecipes = recipes.filter((recipe) =>
    powerSetsMatch(recipe.powers, targetPowers),
  );
  if (matchingRecipes.length === 0) return [];

  const scoredRecipes = matchingRecipes.map((recipe) => ({
    ...recipe,
    score:
      35 * recipe.condiments.filter((c) => c.isHerbaMystica).length +
      5 * recipe.fillings.length +
      recipe.condiments.length,
  }));

  scoredRecipes.sort((a, b) => a.score - b.score);
  const [{ score: lowestScore }] = scoredRecipes;
  const scoreLimit = lowestScore + SCORE_THRESHOLD;

  return scoredRecipes
    .slice(0, RESULT_LIMIT)
    .filter((recipe) => recipe.score <= scoreLimit);
};
