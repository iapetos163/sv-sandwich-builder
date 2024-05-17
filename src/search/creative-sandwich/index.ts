import { ingredients } from '@/data';
// import { Flavor, MealPower, TypeIndex } from '@/enum';
import { Flavor } from '@/enum';
import { solve } from '@/lp';
import { requestedPowersValid, getPowersForIngredients } from '@/mechanics';
import { Ingredient, TargetPower, Sandwich } from '@/types';
import { getModel } from './model';
import { adjustForDroppedPieces, combineDrops } from './pieces';
import { refineTarget, selectInitialTargets, Target } from './target';
import { SandwichResult } from './types';
import { sandwichIsSubset } from './util';

export const emptySandwich = {
  fillings: [],
  condiments: [],
  powers: [],
};

const RESULT_LIMIT = 20; //6 is too little
const SCORE_THRESHOLD = 9;

const filterSandwichResults = async (
  sandwiches: SandwichResult[],
  limit: number,
  multiplayer = false,
) => {
  sandwiches.sort((a, b) => a.score - b.score);
  sandwiches = sandwiches.slice(0, limit);

  if (sandwiches.length === 0) return [];

  if (sandwiches[0].target.arbitraryTypePlaceIndices.length > 0) {
    const targets = refineTarget(sandwiches[0].target);
    const refined = (
      await Promise.all(
        targets.map((target) => makeSandwichForTarget(target, multiplayer)),
      )
    )
      .filter((s): s is SandwichResult => !!s)
      .map(adjustForDroppedPieces)
      .filter((s): s is SandwichResult => !!s);
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
  multiplayer = false,
  noHerba = false,
): Promise<Sandwich[]> => {
  if (!requestedPowersValid(targetPowers, multiplayer)) {
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
    await Promise.all(
      targets.map((target) => makeSandwichForTarget(target, multiplayer)),
    )
  )
    .filter((s): s is SandwichResult => !!s)
    .map(adjustForDroppedPieces)
    .filter((s): s is SandwichResult => !!s);

  if (sandwiches.length === 0) return [];

  let sandwichesByTargetNumHerba: SandwichResult[][] = [[], [], []];
  sandwiches.forEach((sandwich) => {
    const n = sandwich.target.numHerbaMystica;
    sandwichesByTargetNumHerba[n].push(sandwich);
  });
  sandwichesByTargetNumHerba = sandwichesByTargetNumHerba.filter(
    (g) => g.length > 0,
  );
  const limitPerGroup = Math.ceil(
    RESULT_LIMIT / sandwichesByTargetNumHerba.length,
  );

  sandwiches = (
    await Promise.all(
      sandwichesByTargetNumHerba.map((group) =>
        filterSandwichResults(group, limitPerGroup, multiplayer),
      ),
    )
  ).flatMap((g) => g);

  if (noHerba) {
    sandwiches = sandwiches.filter((s) =>
      s.condiments.every((c) => !c.isHerbaMystica),
    );
  }

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
    powers: getPowersForIngredients(
      result.fillings.concat(result.condiments),
      combineDrops(result.requiredPieceDrops, result.optionalPieceDrops),
    ),
  }));
};

const makeSandwichForTarget = async (
  target: Target,
  multiplayer = false,
): Promise<SandwichResult | null> => {
  const maxFillings = multiplayer ? 12 : 6;
  const model = getModel({ multiplayer, target });

  const solution = await solve(model);
  if (solution.status === 'infeasible') return null;

  const score = solution.objectiveValue ?? 0;

  const fillings: Ingredient[] = [];
  const condiments: Ingredient[] = [];
  const pieceDrops: Record<string, number> = {};

  Object.entries(solution.variables).forEach(([id, count]) => {
    const ingredient = ingredients.find((i) => i.id === id);
    if (!ingredient) return;
    if (ingredient.ingredientType === 'filling') {
      const inventoryCount = Math.ceil(count / ingredient.pieces);
      const piecesMod = count % ingredient.pieces;
      if (piecesMod > 0) {
        pieceDrops[ingredient.id] = ingredient.pieces - piecesMod;
      }
      [...Array(inventoryCount).keys()].forEach(() =>
        fillings.push(ingredient),
      );
    } else {
      [...Array(count).keys()].forEach(() => condiments.push(ingredient));
    }
  });

  if (fillings.length > maxFillings) {
    return null;
  }

  return {
    fillings,
    condiments,
    score,
    model,
    requiredPieceDrops: pieceDrops,
    optionalPieceDrops: {},
    target,
  };
};
