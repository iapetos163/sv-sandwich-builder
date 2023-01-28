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
import {
  getTargetConfigs,
  selectPowersAtTargetPositions,
  TargetConfig,
  permutePowerConfigs,
} from './target';
import { boostMealPowerVector } from './vector';

// TODO: change these for multiplayer
const maxFillings = 6;
const maxCondiments = 4;
const maxPieces = 12;

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

  let targetNumHerba = 0;
  if (targetPowers.some((p) => p.mealPower === MealPower.SPARKLING)) {
    targetNumHerba = 2;
  } else if (targetPowers.some((p) => p.mealPower === MealPower.TITLE)) {
    targetNumHerba = 1;
  } else if (targetPowers.some((p) => p.level === 3)) {
    targetNumHerba = 1;
  }

  const sandwich = makeSandwichGivenNumHerba(targetPowers, targetNumHerba);
  if (
    !sandwich &&
    targetNumHerba === 0 &&
    targetPowers.some((tp) => tp.level >= 2)
  ) {
    return makeSandwichGivenNumHerba(targetPowers, 1);
  }
  return sandwich;
};

const makeSandwichGivenNumHerba = (
  targetPowers: Power[],
  targetNumHerba: number,
) => {
  const targetConfigs = getTargetConfigs(targetPowers, targetNumHerba);
  const targetConfigSets = permutePowerConfigs(targetPowers, targetConfigs);

  const visited: Record<string, true> = {};
  const hasBeenVisited = (ingredients: Ingredient[]) => {
    const key = ingredients
      .map((ing) => ing.name)
      .sort()
      .join(',');
    const hasVisited = !!visited[key];
    visited[key] = true;
    return hasVisited;
  };

  type IngredientSelectionState = {
    fillings: Ingredient[];
    condiments: Ingredient[];
    skipIngredients: Record<string, boolean>;
    baseMealPowerVector: number[];
    typeVector: number[];
    flavorVector: number[];
    powers: Power[];
    reachedAllTargets: boolean;
    boostedMealPower: MealPower | null;
    allowHerbaMystica: boolean;
  };

  const initialState: IngredientSelectionState = {
    fillings: [],
    condiments: [],
    skipIngredients: {},
    baseMealPowerVector: [],
    typeVector: [],
    flavorVector: [],
    powers: [],
    reachedAllTargets: false,
    boostedMealPower: null,
    allowHerbaMystica: targetNumHerba > 0,
  };

  const recurse = (state: IngredientSelectionState): Sandwich | null => {
    const {
      fillings,
      condiments,
      skipIngredients,
      flavorVector,
      boostedMealPower,
      baseMealPowerVector,
      typeVector,
      reachedAllTargets: alreadyReachedAllTargets,
      allowHerbaMystica,
      powers,
    } = state;

    if (fillings.length >= maxFillings && condiments.length >= maxCondiments) {
      return null;
    }
    if (hasBeenVisited(fillings.concat(condiments))) {
      return null;
    }

    const currentBoostedMealPowerVector = boostedMealPower
      ? boostMealPowerVector(baseMealPowerVector, boostedMealPower)
      : baseMealPowerVector;

    const condimentsAllowed =
      !alreadyReachedAllTargets || condiments.length === 0;

    // const numEgg = fillings.filter((f) => f.name === 'Egg').length;
    // const numChorizo = fillings.filter((f) => f.name === 'Chorizo').length;
    // const numPepper = condiments.filter((f) => f.name === 'Pepper').length;
    // const numRice = fillings.filter((f) => f.name === 'Rice').length;
    // const numFriedFillet = fillings.filter(
    //   (f) => f.name === 'Fried Fillet',
    // ).length;
    // const numFruit = fillings.filter(
    //   (f) =>
    //     f.name === 'Pineapple' ||
    //     f.name === 'Apple' ||
    //     f.name === 'Banana' ||
    //     f.name === 'Strawberry' ||
    //     f.name === 'Kiwi',
    // ).length;
    // const numJam = condiments.filter((f) => f.name === 'Jam').length;
    // const numMarmalade = condiments.filter(
    //   (f) => f.name === 'Marmalade',
    // ).length;
    // const numFillings = fillings.length;
    // const numCondiments = condiments.length;
    const debugCondition = false;
    //   numFillings === 2 &&
    //   numCondiments === 3 &&
    //   numChorizo === 2 &&
    //   numPepper === 1 &&
    //   numJam === 2;

    const selectedPowerPerTarget = selectPowersForTargets(
      powers,
      targetPowers,
      targetConfigSets,
    );

    const checkMealPower =
      (alreadyReachedAllTargets && condimentsAllowed) ||
      (alreadyReachedAllTargets &&
        !targetPowers.some(
          (tp) =>
            tp.mealPower === MealPower.SPARKLING ||
            tp.mealPower === MealPower.TITLE,
        )) ||
      targetPowers.some(
        (tp, i) => selectedPowerPerTarget[i]?.mealPower !== tp.mealPower,
      );
    const checkType =
      alreadyReachedAllTargets ||
      targetPowers.some(
        (tp, i) =>
          mealPowerHasType(tp.mealPower) &&
          selectedPowerPerTarget[i]?.type !== tp.type,
      );
    const checkLevel = targetPowers.some(
      (tp, i) =>
        !selectedPowerPerTarget[i] ||
        selectedPowerPerTarget[i]!.level < tp.level,
    );

    if (debugCondition) {
      console.debug(
        `
    Sandwich so far: ${fillings
      .concat(condiments)
      .map((ing) => ing.name)
      .join(', ')}
    Target config sets:${['', ...targetConfigSets.map((c) => JSON.stringify(c))]
      .join(`
      `)}
    Boosted meal power: ${boostedMealPower}
    alreadyReachedAllTargets: ${alreadyReachedAllTargets}
    checkMealPower: ${checkMealPower}
    `,
      );
    }
    const newIngredientCandidates = selectIngredientCandidates({
      debug: debugCondition,
      targetPowers,
      targetConfigSets,
      currentBoostedMealPowerVector,
      currentTypeVector: typeVector,
      rankedTypeBoosts: rankTypeBoosts(typeVector),
      rankedMealPowerBoosts: rankMealPowerBoosts(
        baseMealPowerVector,
        boostedMealPower,
      ),
      checkMealPower,
      checkType,
      checkLevel,
      remainingFillings:
        !alreadyReachedAllTargets || fillings.length === 0
          ? maxFillings - fillings.length
          : 0,
      remainingCondiments: condimentsAllowed
        ? maxCondiments - condiments.length
        : 0,
      currentFlavorVector: flavorVector,
      allowHerbaMystica,
      skipIngredients,
    });
    const sandwichCandidates = newIngredientCandidates
      .map((newIngredient, i) => {
        let newFillings = fillings;
        let newCondiments = condiments;
        let newSkipIngredients = skipIngredients;

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
        const reachedAllTargets = powerSetsMatch(newPowers, targetPowers);
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
          newCondiments.length > 0
        ) {
          return {
            fillings: newFillings,
            condiments: newCondiments,
            typeBoosts: newTypeVector,
            flavorBoosts: newFlavorVector,
            mealPowerBoosts: newMealPowerVector,
            powers: newPowers,
          };
        }

        return recurse({
          fillings: newFillings,
          condiments: newCondiments,
          typeVector: newTypeVector,
          baseMealPowerVector: add(
            baseMealPowerVector,
            newIngredient.baseMealPowerVector,
          ),
          flavorVector: newFlavorVector,
          powers: newPowers,
          reachedAllTargets,
          boostedMealPower: newBoostedMealPower,
          skipIngredients: newSkipIngredients,
          allowHerbaMystica:
            allowHerbaMystica &&
            newCondiments.filter((c) => c.isHerbaMystica).length <
              targetNumHerba,
        });
      })
      .filter((s): s is Sandwich => !!s);

    if (sandwichCandidates.length === 0) return null;

    sandwichCandidates.sort(
      (a, b) =>
        10 * (a.fillings.length - b.fillings.length) +
        a.condiments.length -
        b.condiments.length,
    );
    return sandwichCandidates[0];
  };

  return recurse(initialState);
};
