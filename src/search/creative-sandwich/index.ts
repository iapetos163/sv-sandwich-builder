//@ts-expect-error
import { solve } from 'yalps';
import { ingredients } from '@/data';
import {
  requestedPowersValid,
  getBoostedMealPower,
  rankFlavorBoosts,
  evaluateBoosts,
} from '@/mechanics';
import { Ingredient, Power, Sandwich } from '@/types';
import { add } from '@/vector-math';
import { getModel } from './model';
import { selectInitialTargets, Target } from './target';

const getPowersForIngredients = (ingredients: Ingredient[]) => {
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

export const emptySandwich = {
  fillings: [],
  condiments: [],
  powers: [],
};

export const makeSandwichForPowers = (
  targetPowers: Power[],
): Sandwich | null => {
  if (!requestedPowersValid(targetPowers)) {
    return null;
  }

  const targets = selectInitialTargets({
    targetPowers,
    avoidHerbaMystica: true,
  });
  const sandwiches = targets
    .map((target) => makeSandwichForTarget(target))
    .filter((s): s is SandwichResult => !!s);
  sandwiches.sort((a, b) => a.score - b.score);
  const result = sandwiches[0];
  if (!result) return null;
  const powers = getPowersForIngredients(
    result.fillings.concat(result.condiments),
  );

  return {
    ...result,
    powers,
  };
};

type SandwichResult = {
  score: number;
  fillings: Ingredient[];
  condiments: Ingredient[];
};

const makeSandwichForTarget = (
  target: Target,
  multiplayer = false,
): SandwichResult | null => {
  // TODO meal power
  // TODO types
  const model = getModel({ multiplayer, target });

  const solution = solve(model);
  if (solution.status === 'infeasible') return null;

  if (solution.status === 'optimal') {
    const [, score = 0] = solution.variables.find(([n]) => n === 'score') ?? [];

    const fillings: Ingredient[] = [];
    const condiments: Ingredient[] = [];

    solution.variables.forEach(([name, count]) => {
      const ingredient = ingredients.find((i) => i.name === name);
      if (!ingredient) return;
      if (ingredient.ingredientType === 'filling') {
        new Array(count).forEach(() => fillings.push(ingredient));
      } else {
        new Array(count).forEach(() => condiments.push(ingredient));
      }
    });

    return { fillings, condiments, score };
  }
  throw solution;
};
