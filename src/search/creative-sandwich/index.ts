import { ingredients } from '@/data';
// import { Flavor, MealPower, TypeIndex } from '@/enum';
import { Model, solve } from '@/lp';
import { requestedPowersValid, getPowersForIngredients } from '@/mechanics';
import { Ingredient, Power, Sandwich } from '@/types';
import { getModel } from './model';
import { sandwichIsSubset } from './subset';
import { refineTarget, selectInitialTargets, Target } from './target';

export const emptySandwich = {
  fillings: [],
  condiments: [],
  powers: [],
};

const SCORE_THRESHOLD = 1.2;
const RESULT_LIMIT = 3;

export const makeSandwichesForPowers = async (
  targetPowers: Power[],
): Promise<Sandwich[]> => {
  if (!requestedPowersValid(targetPowers)) {
    return [];
  }

  const targets = selectInitialTargets({
    targetPowers,
    avoidHerbaMystica: true,
  });
  // const expectedSuccessfulTargets = targets.filter(
  //   (t) =>
  //     t.typeAllocation === 'ONE_THREE_TWO' &&
  //     t.flavorProfile![0] === Flavor.SOUR &&
  //     t.flavorProfile![1] === Flavor.SWEET &&
  //     t.typesByPlace[0] === TypeIndex.DARK,
  // );
  // console.debug(expectedSuccessfulTargets);
  let sandwiches = (
    await Promise.all(targets.map((target) => makeSandwichForTarget(target)))
  ).filter((s): s is SandwichResult => !!s);

  if (sandwiches.length === 0) return [];

  sandwiches.sort((a, b) => a.score - b.score);
  sandwiches = sandwiches.slice(0, RESULT_LIMIT);
  const initialScoreThreshold = sandwiches[0].score * SCORE_THRESHOLD;
  const numInitialSandwiches = sandwiches.filter(
    (s) => s.score <= initialScoreThreshold,
  ).length;
  const refinedSandwichLimit = Math.ceil(RESULT_LIMIT / numInitialSandwiches);

  sandwiches = (
    await Promise.all(
      sandwiches.map(async (result) => {
        if (result.target.arbitraryTypePlaceIndices.length > 0) {
          const targets = refineTarget(result.target);
          const sandwiches = (
            await Promise.all(
              targets.map((target) => makeSandwichForTarget(target)),
            )
          )
            .filter((s): s is SandwichResult => !!s)
            .filter((s) => s);
          sandwiches.sort((a, b) => a.score - b.score);
          return sandwiches.slice(0, refinedSandwichLimit);
        } else {
          return [result];
        }
      }),
    )
  ).flatMap((ss) => ss);
  sandwiches.sort((a, b) => a.score - b.score);

  // Filter out supersets
  sandwiches = sandwiches
    .slice(0, RESULT_LIMIT)
    .reduce<SandwichResult[]>((sandwiches, sandwich) => {
      const isSuperset = sandwiches.some((s) => sandwichIsSubset(s, sandwich));
      if (isSuperset) return sandwiches;
      return [...sandwiches, sandwich];
    }, []);

  return sandwiches.map((result) => ({
    ...result,
    powers: getPowersForIngredients(result.fillings.concat(result.condiments)),
  }));
};

export type SandwichResult = {
  score: number;
  fillings: Ingredient[];
  condiments: Ingredient[];
  model: Model;
  target: Target;
};

const makeSandwichForTarget = async (
  target: Target,
  multiplayer = false,
): Promise<SandwichResult | null> => {
  const model = getModel({ multiplayer, target });

  const solution = await solve(model);
  if (solution.status === 'infeasible') return null;

  const score = solution.objectiveValue ?? 0;

  const fillings: Ingredient[] = [];
  const condiments: Ingredient[] = [];

  Object.entries(solution.variables).forEach(([name, count]) => {
    const ingredient = ingredients.find((i) => i.name === name);
    if (!ingredient) return;
    if (ingredient.ingredientType === 'filling') {
      [...Array(count).keys()].forEach(() => fillings.push(ingredient));
    } else {
      [...Array(count).keys()].forEach(() => condiments.push(ingredient));
    }
  });

  return { fillings, condiments, score, model, target };
};
