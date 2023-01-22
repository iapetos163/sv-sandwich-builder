import { ingredients } from '../data';
import { MealPower } from '../enum';
import { Ingredient, Power, Sandwich } from '../types';
import { add, diff, innerProduct, norm } from '../vector-math';
import {
  evaluateBoosts,
  getTargetConfigs,
  mealPowerHasType,
  powersMatch,
  rankTypeBoosts,
  selectPowersAtTargetPositions,
  TargetConfig,
  TypeBoost,
  getTypeTargetIndices,
  MealPowerBoost,
  rankMealPowerBoosts,
  permutePowerConfigs,
  requestedPowersValid,
} from './powers';
import {
  boostMealPowerVector,
  getTargetLevelVector,
  getTargetMealPowerVector,
  getTargetTypeVector,
} from './powers/vector';
import {
  getRelativeTasteVector,
  getBoostedMealPower,
  rankFlavorBoosts,
} from './taste';

const CANDIDATE_SCORE_THRESHOLD = 0.2;
const MAX_CANDIDATES = 3;
const CONDIMENT_BONUS = 0.4;

// TODO: change these for multiplayer
const maxFillings = 6;
const maxCondiments = 4;
const maxPieces = 12;

const MP_FILLING = 21;
const MP_CONDIMENT = 21;
const TYPE_FILLING = 36;
const TYPE_CONDIMENT = 4;

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

const getBaseVector = (currentVector: number[]) => {
  // const minComponent = Math.min(...currentVector);
  return currentVector.map((comp) => (comp >= 0 ? 0 : comp));
};

const getBaseDelta = (target: number[], current: number[]) => {
  const base = getBaseVector(current);
  return norm(diff(target, base));
};

export interface ScoreWeightProps {
  targetVector: number[];
  deltaVector: number[];
  currentVector: number[];
  remainingFillings: number;
  remainingCondiments: number;
}

export const getMpScoreWeight = ({
  targetVector,
  deltaVector,
  currentVector,
  remainingFillings,
  remainingCondiments,
}: ScoreWeightProps) => {
  const baseDelta = getBaseDelta(targetVector, currentVector);

  const urgency =
    norm(deltaVector) /
    (MP_FILLING * remainingFillings + MP_CONDIMENT * remainingCondiments);
  const weight = urgency / Math.max(baseDelta, 100);
  return weight;
};

export const getTypeScoreWeight = ({
  targetVector,
  deltaVector,
  currentVector,
  remainingFillings,
  remainingCondiments,
}: ScoreWeightProps) => {
  const baseDelta = getBaseDelta(targetVector, currentVector);

  const weight =
    norm(deltaVector) /
    (baseDelta *
      (TYPE_FILLING * remainingFillings +
        TYPE_CONDIMENT * remainingCondiments));
  return weight;
};

type ScoredIngredient = {
  ing: Ingredient | null;
  score: number;
};

interface SelectIngredientProps {
  targetPowers: Power[];
  targetConfigSets: TargetConfig[][];
  currentBoostedMealPowerVector: number[];
  currentTypeVector: number[];
  rankedTypeBoosts: TypeBoost[];
  rankedMealPowerBoosts: MealPowerBoost[];
  checkMealPower: boolean;
  checkType: boolean;
  checkLevel: boolean;
  remainingFillings: number;
  remainingCondiments: number;
  allowHerbaMystica: boolean;
  skipIngredients: Record<string, boolean>;
  currentFlavorVector: number[];
  debug?: boolean;
}

const selectIngredientCandidates = ({
  targetPowers,
  targetConfigSets,
  currentBoostedMealPowerVector,
  currentTypeVector,
  rankedTypeBoosts,
  rankedMealPowerBoosts,
  currentFlavorVector,
  checkMealPower,
  checkType,
  checkLevel,
  skipIngredients,
  allowHerbaMystica,
  remainingCondiments,
  remainingFillings,
  debug,
}: SelectIngredientProps) => {
  let targetTypeVector: number[] = [];
  let targetLevelVector: number[] = [];
  let deltaTypeVector: number[] = [];
  let deltaLevelVector: number[] = [];
  let deltaTypeNorm = Infinity;
  let deltaLevelNorm = Infinity;
  let targetConfigSet = targetConfigSets[0];
  for (const candidateConfigSet of targetConfigSets) {
    const targetTypes = getTypeTargetIndices(
      targetPowers,
      candidateConfigSet.map((c) => c.typePlaceIndex),
      rankedTypeBoosts,
    );
    const candTargetTypeVector = checkType
      ? getTargetTypeVector({
          targetPowers,
          targetConfigSet: candidateConfigSet,
          rankedTypeBoosts,
          targetTypeIndices: targetTypes,
          typeVector: currentTypeVector,
        })
      : currentTypeVector;

    const candTargetLevelVector = getTargetLevelVector({
      targetPowers,
      targetConfigSet: candidateConfigSet,
      targetTypes,
      typeVector: currentTypeVector,
    });
    const candDeltaTypeVector = diff(candTargetTypeVector, currentTypeVector);
    const candDeltaLevelVector = diff(candTargetLevelVector, currentTypeVector);
    const candDeltaTypeNorm = norm(candDeltaTypeVector);
    const candDeltaLevelNorm = norm(candDeltaLevelVector);

    if (
      Math.max(candDeltaLevelNorm, candDeltaTypeNorm) <
      Math.max(deltaLevelNorm, deltaTypeNorm)
    ) {
      targetTypeVector = candTargetTypeVector;
      targetLevelVector = candTargetLevelVector;
      deltaTypeVector = candDeltaTypeVector;
      deltaLevelVector = candDeltaLevelVector;
      deltaTypeNorm = candDeltaTypeNorm;
      deltaLevelNorm = candDeltaLevelNorm;
      targetConfigSet = candidateConfigSet;
    }
  }
  if (deltaTypeNorm === Infinity || deltaLevelNorm === Infinity) {
    if (debug) {
      console.debug('Cannot satisfy constraints for target configs', {
        targetConfigSets,
        currentTypeVector,
        targetTypeVector,
        targetLevelVector,
        targetPowers,
      });
    }
    return [];
  }

  const targetMealPowerVector = getTargetMealPowerVector({
    targetPowers,
    targetConfigSet,
    rankedMealPowerBoosts,
    mealPowerVector: currentBoostedMealPowerVector,
  });

  const deltaMealPowerVector = diff(
    targetMealPowerVector,
    currentBoostedMealPowerVector,
  );
  const deltaMpNorm = norm(deltaMealPowerVector);

  let typeScoreWeight = checkType
    ? getTypeScoreWeight({
        targetVector: targetTypeVector,
        deltaVector: deltaTypeVector,
        currentVector: currentTypeVector,
        remainingFillings,
        remainingCondiments,
      })
    : 0;
  const levelScoreWeight = checkLevel
    ? getTypeScoreWeight({
        targetVector: targetLevelVector,
        deltaVector: deltaLevelVector,
        currentVector: currentTypeVector,
        remainingFillings,
        remainingCondiments,
      })
    : 0;
  const mealPowerScoreWeight = checkMealPower
    ? getMpScoreWeight({
        targetVector: targetMealPowerVector,
        deltaVector: deltaMealPowerVector,
        currentVector: currentBoostedMealPowerVector,
        remainingFillings,
        remainingCondiments,
      })
    : 0;

  // In the case we are forced to pick an ingredient but we have what we need
  // Force a nonzero deltaTypeVector
  if (
    deltaTypeNorm === 0 &&
    typeScoreWeight === 0 &&
    mealPowerScoreWeight === 0
  ) {
    const targetTypeIndices = getTypeTargetIndices(
      targetPowers,
      targetConfigSet.map((c) => c.typePlaceIndex),
      rankedTypeBoosts,
    );
    targetTypeVector = getTargetTypeVector({
      targetPowers,
      targetConfigSet,
      targetTypeIndices,
      rankedTypeBoosts,
      typeVector: currentTypeVector,
      forceDiff: true,
    });
    deltaTypeVector = diff(targetTypeVector, currentTypeVector);
    deltaTypeNorm = norm(deltaTypeVector);
    typeScoreWeight = 1;
  }

  let bestScore = -Infinity;
  let bestMealPowerProduct = -Infinity;
  let bestTypeProduct = -Infinity;
  let bestLevelProduct = -Infinity;

  const ingredientMapper = (ing: Ingredient): ScoredIngredient => {
    if (
      (remainingFillings <= 0 && ing.ingredientType === 'filling') ||
      (remainingCondiments <= 0 && ing.ingredientType === 'condiment') ||
      (!allowHerbaMystica && ing.isHerbaMystica) ||
      skipIngredients[ing.name]
    ) {
      return { ing: null, score: -Infinity };
    }

    const relativeTasteVector = getRelativeTasteVector({
      currentFlavorVector,
      ingredientFlavorVector: ing.flavorVector,
    });

    const relevantTaste = relativeTasteVector.map((c, mp) =>
      targetPowers.some((tp) => tp.mealPower === mp) || c < 0 ? c : 0,
    );
    const boostedMealPowerVector = add(ing.baseMealPowerVector, relevantTaste);

    const positiveBoostedMpNorm = norm(
      boostedMealPowerVector.map((c) => (c > 0 ? c : 0)),
    );
    const n1 = deltaMpNorm * Math.sqrt(positiveBoostedMpNorm);
    const mealPowerProduct =
      checkMealPower && n1 !== 0
        ? innerProduct(boostedMealPowerVector, deltaMealPowerVector) / n1
        : 0;
    const positiveTypeNorm = norm(ing.typeVector.map((c) => (c > 0 ? c : 0)));
    const n2 = Math.sqrt(positiveTypeNorm) * deltaTypeNorm;
    const typeProduct =
      checkType && n2 !== 0
        ? innerProduct(ing.typeVector, deltaTypeVector) / n2
        : 0;
    const n3 = deltaLevelNorm;
    const levelProduct =
      n3 !== 0 ? innerProduct(ing.typeVector, deltaLevelVector) / n3 : 0;
    const score =
      (mealPowerProduct * mealPowerScoreWeight +
        typeProduct * typeScoreWeight +
        levelProduct * levelScoreWeight) *
      (1 +
        (ing.ingredientType === 'condiment' && !ing.isHerbaMystica
          ? CONDIMENT_BONUS
          : 0));

    if (debug && (ing.name === 'Salt' || ing.name === 'Pepper')) {
      console.debug(
        `${ing.name}: ${score}
    Raw scores: ${mealPowerProduct}, ${typeProduct}, ${levelProduct}
    Relative taste vector: ${relativeTasteVector}
    Boosted meal power vector: ${boostedMealPowerVector}
      n1: ${deltaMpNorm} * ${Math.sqrt(positiveBoostedMpNorm)} = ${n1}
    Type vector: ${ing.typeVector}
      n2: ${deltaTypeNorm} * ${Math.sqrt(positiveTypeNorm)} = ${n2}
    `,
      );
    }

    if (score > bestScore) {
      bestScore = score;
      bestMealPowerProduct = mealPowerProduct;
      bestTypeProduct = typeProduct;
      bestLevelProduct = levelProduct;
    }
    return {
      ing,
      score,
    };
  };

  const scoredIngredients = ingredients.map(ingredientMapper);
  scoredIngredients.sort((a, b) => b.score - a.score);

  const minScore = bestScore - CANDIDATE_SCORE_THRESHOLD * Math.abs(bestScore);
  const candidateScoredIngredients = scoredIngredients.filter(
    ({ ing, score }) => ing && score >= minScore,
  );

  // TODO: any herba mystica
  if (debug) {
    console.debug(`
    Selecting top ${MAX_CANDIDATES} candidates from:${[
      '',
      ...candidateScoredIngredients.map(
        ({ ing, score }) => `${ing?.name}: ${score}`,
      ),
    ].join(`
      `)}
    Respective scores: 
    Weights: ${mealPowerScoreWeight}, ${typeScoreWeight}, ${levelScoreWeight}
    Raw score components of ${
      candidateScoredIngredients[0]?.ing?.name
    }: ${bestMealPowerProduct}, ${bestTypeProduct}, ${bestLevelProduct}
    Target MP: ${targetMealPowerVector}
    Delta MP: ${deltaMealPowerVector}
    Current MP: ${currentBoostedMealPowerVector}
    Target T: ${targetTypeVector}
    Delta T: ${deltaTypeVector}
    Target L: ${targetLevelVector}
    Delta L: ${deltaLevelVector}
    Current T: ${currentTypeVector}
    Remaining fillings: ${remainingFillings}
    Remaining condiments: ${remainingCondiments}`);
  }

  return candidateScoredIngredients
    .slice(0, MAX_CANDIDATES)
    .map(({ ing }) => ing as Ingredient);
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
  const targetConfigSets = permutePowerConfigs(targetConfigs);

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

    const numEgg = fillings.filter((f) => f.name === 'Egg').length;
    const numChorizo = fillings.filter((f) => f.name === 'Chorizo').length;
    const numPepper = condiments.filter((f) => f.name === 'Pepper').length;
    const numFillings = fillings.length;
    const numCondiments = condiments.length;
    const debugCondition = false;

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
        const reachedAllTargets = targetPowers.every((tp) =>
          newPowers.some((p) => powersMatch(p, tp)),
        );
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
