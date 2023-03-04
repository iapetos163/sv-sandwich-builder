import { MealPower } from '../../enum';
import {
  evaluateBoosts,
  mealPowerHasType,
  rankTypeBoosts,
  rankMealPowerBoosts,
  requestedPowersValid,
  powerSetsMatch,
  getBoostedMealPower,
  rankFlavorBoosts,
} from '../../mechanics';
import { Ingredient, Power, Sandwich } from '../../types';
import { add } from '../../vector-math';
import { selectIngredientCandidates } from './select-ingredient';
import { selectInitialTargets, Target } from './select-target';
import {
  getTargetConfigs,
  selectPowersAtTargetPositions,
  TargetConfig,
  permutePowerConfigs,
} from './target';
import { boostMealPowerVector } from './vector';

const SCORE_THRESHOLD = 0.2;

export const emptySandwich = {
  fillings: [],
  condiments: [],
  mealPowerBoosts: {},
  flavorBoosts: {},
  typeBoosts: {},
};

const selectPowersForTargets = (
  actualPowers: Power[],
  targetPowers: Power[],
  targetConfigSets: TargetConfig[][],
) => {
  const candidatePowerSets = targetConfigSets.map((configSet) =>
    selectPowersAtTargetPositions(actualPowers, configSet),
  );

  // TODO; this might not be quite right
  return (
    (candidatePowerSets.length > 1 &&
      candidatePowerSets.find((candidatePowers) =>
        candidatePowers.every(
          (p, i) =>
            p &&
            (p.mealPower === targetPowers[i].mealPower ||
              p.type === targetPowers[i].type ||
              p.level >= targetPowers[i].level),
        ),
      )) ||
    candidatePowerSets[0]
  );
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

  const recurse = (state: IngredientSelectionState): Sandwich[] => {
    const {
      fillings,
      condiments,
      herba,
      skipIngredients,
      flavorVector,
      baseMealPowerVector,
      typeVector,
      reachedAllTargets: alreadyReachedAllTargets,
      score,
    } = state;

    if (fillings.length >= maxFillings && condiments.length >= maxCondiments) {
      return [];
    }

    const condimentsAllowed =
      !alreadyReachedAllTargets || condiments.length === 0;

    const debugCondition = false;

    if (debugCondition) {
      console.debug(
        `
    Sandwich so far: ${fillings
      .concat(condiments)
      .map((ing) => ing.name)
      .join(', ')}
    Target config set:${target.configSet}
    alreadyReachedAllTargets: ${alreadyReachedAllTargets}
    `,
      );
    }
    const newIngredientCandidates = selectIngredientCandidates({
      debug: debugCondition,
      target,
      currentTypeVector: typeVector,
      rankedTypeBoosts: rankTypeBoosts(typeVector),
      rankedMealPowerBoosts: rankMealPowerBoosts(baseMealPowerVector),
      maxScore,
      remainingFillings:
        !alreadyReachedAllTargets || fillings.length === 0
          ? maxFillings - fillings.length
          : 0,
      remainingCondiments: condimentsAllowed
        ? maxCondiments - condiments.length
        : 0,
      currentFlavorVector: flavorVector,
      remainingHerba: target.numHerbaMystica - herba.length,
      skipIngredients,
    });
    const { sandwiches } = newIngredientCandidates.reduce<{
      sandwiches: Sandwich[];
      triedIngredients: Ingredient[];
    }>(
      ({ sandwiches, triedIngredients }, newIngredient, i) => {
        let newFillings = fillings;
        let newCondiments = condiments;
        let newHerba = herba;
        let newSkipIngredients = {
          ...skipIngredients,
          ...Object.fromEntries(
            triedIngredients.map((ing): [string, true] => [ing.name, true]),
          ),
        };

        if (newIngredient.ingredientType === 'filling') {
          newFillings = [...fillings, newIngredient];

          const numOfIngredient = newFillings.filter(
            (f) => f.name === newIngredient.name,
          ).length;
          const numPieces = numOfIngredient * newIngredient.pieces;
          if (numPieces + newIngredient.pieces > maxPieces) {
            newSkipIngredients = {
              ...newSkipIngredients,
              [newIngredient.name]: true,
            };
          }
        } else if (newIngredient.isHerbaMystica) {
          newHerba = [...herba, newIngredient];
        } else {
          newCondiments = [...condiments, newIngredient];
        }

        const newMealPowerVector = add(
          baseMealPowerVector,
          newIngredient.baseMealPowerVector,
        );
        const newFlavorVector = add(flavorVector, newIngredient.flavorVector);
        const newTypeVector = add(typeVector, newIngredient.typeVector);
        const rankedFlavorBoosts = rankFlavorBoosts(newFlavorVector);
        const newBoostedMealPower = getBoostedMealPower(rankedFlavorBoosts);

        const newPowers = evaluateBoosts(
          newMealPowerVector,
          newBoostedMealPower,
          newTypeVector,
        );
        const reachedAllTargets = powerSetsMatch(newPowers, target.powers);
        if (debugCondition && newIngredient.name === 'Salt') {
          console.debug({
            newMealPowerVector,
            newBoostedMealPower,
            newTypeVector,
            newFlavorVector,
            newPowers,
            newFillings,
            newCondiments,
            reachedAllTargets,
          });
        }

        if (
          reachedAllTargets &&
          newFillings.length > 0 &&
          newCondiments.length + newHerba.length > 0
        ) {
          return {
            sandwiches: [
              ...sandwiches,
              {
                fillings: newFillings,
                condiments: newCondiments.concat(newHerba),
                typeBoosts: newTypeVector,
                flavorBoosts: newFlavorVector,
                mealPowerBoosts: newMealPowerVector,
                powers: newPowers,
                score: score + newIngredient.score,
              },
            ],
            triedIngredients: [...triedIngredients, newIngredient],
          };
        }

        return {
          sandwiches: [
            ...sandwiches,
            recurse({
              fillings: newFillings,
              condiments: newCondiments,
              herba: newHerba,
              typeVector: newTypeVector,
              baseMealPowerVector: add(
                baseMealPowerVector,
                newIngredient.baseMealPowerVector,
              ),
              flavorVector: newFlavorVector,
              reachedAllTargets,
              skipIngredients: newSkipIngredients,
              score: score + newIngredient.score,
            }),
          ],
          triedIngredients: [...triedIngredients, newIngredient],
        };
      },
      { sandwiches: [], triedIngredients: [] },
    );

    sandwiches.sort((a, b) => a.score - b.score);
    return sandwiches;
  };

  return recurse(initialState);
};
