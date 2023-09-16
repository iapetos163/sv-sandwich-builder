import { ingredients } from '@/data';
// import { Flavor, MealPower, TypeIndex } from '@/enum';
import { Model, solve } from '@/lp';
import { requestedPowersValid, getPowersForIngredients } from '@/mechanics';
import { Ingredient, TargetPower, Sandwich } from '@/types';
import { getModel } from './model';
import { refineTarget, selectInitialTargets, Target } from './target';
import { sandwichIsSubset } from './util';

export const emptySandwich = {
  fillings: [],
  condiments: [],
  powers: [],
};

const RESULT_LIMIT = 6;
const SCORE_THRESHOLD = 9;

const filterSandwichResults = async (
  sandwiches: SandwichResult[],
  limit: number,
) => {
  sandwiches.sort((a, b) => a.score - b.score);
  sandwiches = sandwiches.slice(0, limit);

  if (sandwiches[0].target.arbitraryTypePlaceIndices.length > 0) {
    const targets = refineTarget(sandwiches[0].target);
    const refined = (
      await Promise.all(targets.map((target) => makeSandwichForTarget(target)))
    ).filter((s): s is SandwichResult => !!s);
    refined.sort((a, b) => a.score - b.score);

    sandwiches.push(...refined);
  }
  sandwiches.sort((a, b) => a.score - b.score);

  const [{ score: lowestScore }] = sandwiches;
  const scoreLimit = lowestScore + SCORE_THRESHOLD;

  return sandwiches.filter((sandwich) => sandwich.score <= scoreLimit);
};

export const makeSandwichesForPowers = async (
  targetPowers: TargetPower[],
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

  let sandwichesByNumHerba: SandwichResult[][] = [[], [], []];
  sandwiches.forEach((sandwich) => {
    const n = sandwich.target.numHerbaMystica;
    sandwichesByNumHerba[n].push(sandwich);
  });
  sandwichesByNumHerba = sandwichesByNumHerba.filter((g) => g.length > 0);
  const limitPerGroup = Math.ceil(RESULT_LIMIT / sandwichesByNumHerba.length);

  sandwiches = (
    await Promise.all(
      sandwichesByNumHerba.map((group) =>
        filterSandwichResults(group, limitPerGroup),
      ),
    )
  ).flatMap((g) => g);

  // Filter out supersets
  sandwiches = sandwiches
    .reduce<SandwichResult[]>((sandwiches, sandwich) => {
      const isSuperset = sandwiches.some((s) => sandwichIsSubset(s, sandwich));
      if (isSuperset) return sandwiches;
      return [...sandwiches, sandwich];
    }, [])
    .slice(0, RESULT_LIMIT);

  return sandwiches.map((result) => ({
    ...result,
    requiredPieceDrops: {},
    optionalPieceDrops: {},
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

  Object.entries(solution.variables).forEach(([id, count]) => {
    const ingredient = ingredients.find((i) => i.id === id);
    if (!ingredient) return;
    if (ingredient.ingredientType === 'filling') {
      [...Array(count).keys()].forEach(() => fillings.push(ingredient));
    } else {
      [...Array(count).keys()].forEach(() => condiments.push(ingredient));
    }
  });

  return { fillings, condiments, score, model, target };
};
