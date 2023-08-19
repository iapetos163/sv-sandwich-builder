import { MealPower } from '@/enum';
import { requestedPowersValid } from '@/mechanics';
import { Ingredient, Power, Sandwich } from '@/types';
import { selectInitialTargets, Target } from './target';
//@ts-expect-error
import { solve } from 'yalps';
import { ingredients } from '@/data';
import { getModel } from './model';

export const emptySandwich = {
  fillings: [],
  condiments: [],
  mealPowerBoosts: {},
  flavorBoosts: {},
  typeBoosts: {},
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
  return sandwiches[0] ?? null;
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
  const model = getModel({ multiplayer });

  const solution = solve(model);
  if (solution.status === 'infeasible') return null;

  if (solution.status === 'optimal') {
    const [, score] = solution.variables.find(([n]) => n === 'score') ?? [, 0];

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
