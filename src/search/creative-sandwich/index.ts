import { MealPower } from '@/enum';
import { requestedPowersValid } from '@/mechanics';
import { Ingredient, Power, Sandwich } from '@/types';
import { selectInitialTargets, Target } from './target';
//@ts-expect-error
import { solve } from 'yalps';
import { ingredients } from '@/data';
import { getModel } from './model';

const SCORE_THRESHOLD = 0.2;

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
  const { sandwiches } = targets.reduce<{
    sandwiches: Sandwich[];
    leastScore: number;
  }>(
    ({ sandwiches, leastScore }, target) => {
      const newSandwich = makeSandwichForTarget(
        target,
        leastScore * (1 + SCORE_THRESHOLD),
      );
      if (!newSandwich) return { sandwiches, leastScore };

      const allSandwiches = [...sandwiches, newSandwich];
      if (newSandwich.score >= leastScore) {
        return {
          sandwiches: allSandwiches,
          leastScore,
        };
      }

      const newMaxScore = newSandwich.score * (1 + SCORE_THRESHOLD);
      return {
        sandwiches: allSandwiches.filter((s) => s.score <= newMaxScore),
        leastScore: newSandwich.score,
      };
    },
    { leastScore: Infinity, sandwiches: [] },
  );

  sandwiches.sort((a, b) => a.score - b.score);
  return sandwiches[0] ?? null;
};

const makeSandwichForTarget = (
  target: Target,
  maxScore: number,
  multiplayer = false,
): Sandwich | null => {
  type IngredientSelectionState = {
    fillings: Ingredient[];
    condiments: Ingredient[];
    herba: Ingredient[];
    skipIngredients: Record<string, boolean>;
    baseMealPowerVector: number[];
    typeVector: number[];
    flavorVector: number[];
    reachedAllTargets: boolean;
    score: number;
  };

  const initialState: IngredientSelectionState = {
    fillings: [],
    condiments: [],
    herba: [],
    skipIngredients: {},
    baseMealPowerVector: [],
    typeVector: [],
    flavorVector: [],
    reachedAllTargets: false,
    score: 0,
  };

  const model = getModel({ multiplayer });

  const solution = solve(model);
  if (solution.status === 'infeasible') return null;

  solution.variables;
  if (solution.status === 'optimal') {
    console.log(solution.variables);
    return null; // TODO
  }
  throw solution;
};
