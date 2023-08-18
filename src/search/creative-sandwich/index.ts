import { MealPower } from '../../enum';
import { requestedPowersValid } from '../../mechanics';
import { Ingredient, Power, Sandwich } from '../../types';
import { selectInitialTargets, Target } from './target';

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
      const newSandwiches = makeSandwichesForTarget(
        target,
        leastScore * (1 + SCORE_THRESHOLD),
      );
      const leastScoreOfNew = Math.min(...newSandwiches.map((s) => s.score));
      const allSandwiches = sandwiches.concat(newSandwiches);
      if (leastScoreOfNew >= leastScore) {
        return {
          sandwiches: allSandwiches,
          leastScore,
        };
      }

      const newMaxScore = leastScoreOfNew * (1 + SCORE_THRESHOLD);
      return {
        sandwiches: allSandwiches.filter((s) => s.score <= newMaxScore),
        leastScore: leastScoreOfNew,
      };
    },
    { leastScore: Infinity, sandwiches: [] },
  );

  sandwiches.sort((a, b) => a.score - b.score);
  return sandwiches[0] ?? null;
};

const makeSandwichesForTarget = (
  target: Target,
  maxScore: number,
  multiplayer = false,
): Sandwich[] => {
  const maxFillings = multiplayer ? 12 : 6;
  const maxCondiments = multiplayer ? 8 : 4;
  const maxPieces = multiplayer ? 15 : 12;

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

  // TODO
  return [];
};
