import { ingredients } from '../data';
import { Flavor, MealPower, mealPowers, TypeName } from '../strings';
import { Ingredient, Power, Sandwich, Boosts } from '../types';
import { add, diff, innerProduct, norm } from '../vector-math';
import { addBoosts } from './boost';
import {
  boostMealPowerVector,
  evaluateBoosts,
  getTargetConfigs,
  getTargetLevelVector,
  getTargetMealPowerVector,
  getTargetTypeVector,
  mealPowerHasType,
  powersMatch,
  rankTypeBoosts,
  TargetConfig,
  TypeBoost,
} from './powers';
import {
  getRelativeTasteVector,
  getBoostedMealPower,
  rankFlavorBoosts,
} from './taste';

const CANDIDATE_SCORE_THRESHOLD = 0.4;
const MAX_CANDIDATES = 3;

interface SelectIngredientProps {
  targetPower: Power;
  targetConfigs: TargetConfig[];
  currentBoostedMealPowerVector: number[];
  currentTypeVector: number[];
  rankedTypeBoosts: TypeBoost[];
  checkMealPower: boolean;
  checkType: boolean;
  checkLevel: boolean;
  remainingFillings: number;
  remainingCondiments: number;
  allowHerbaMystica: boolean;
  skipIngredients: Record<string, boolean>;
  currentFlavorBoosts: Boosts<Flavor>;
  debug?: boolean;
}

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

const getBaseVector = (currentVector: number[]) => {
  // const minComponent = Math.min(...currentVector);
  return currentVector.map((comp) => (comp >= 0 ? 0 : comp));
};

const getBaseDelta = (target: number[], current: number[]) => {
  const base = getBaseVector(current);
  return norm(diff(target, base));
};

const MP_FILLING = 21;
const MP_CONDIMENT = 21;
const TYPE_FILLING = 36;
const TYPE_CONDIMENT = 4;

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

const selectIngredientCandidates = ({
  targetPower,
  targetConfigs,
  currentBoostedMealPowerVector,
  currentTypeVector,
  rankedTypeBoosts,
  currentFlavorBoosts,
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
  let targetConfig: TargetConfig;
  for (const candidateConfig of targetConfigs) {
    const candTargetTypeVector = checkType
      ? getTargetTypeVector({
          targetPower,
          targetConfig: candidateConfig,
          rankedTypeBoosts,
          typeVector: currentTypeVector,
        })
      : currentTypeVector;

    const candTargetLevelVector = getTargetLevelVector(
      targetPower,
      // candidateConfig,
      currentTypeVector,
    );
    const candDeltaTypeVector = diff(candTargetTypeVector, currentTypeVector);
    const candDeltaLevelVector = diff(candTargetLevelVector, currentTypeVector);
    const candDeltaTypeNorm = norm(candDeltaTypeVector);
    const candDeltaLevelNorm = norm(candDeltaLevelVector);
    const candTargetConfig = candidateConfig;

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
      targetConfig = candTargetConfig;
    }
  }
  if (deltaTypeNorm === Infinity || deltaLevelNorm === Infinity) {
    if (debug) {
      console.debug('Cannot satisfy constraints for target configs', {
        targetConfigs,
        currentTypeVector,
        targetPower,
      });
    }
    return [];
  }

  const targetMealPowerVector = getTargetMealPowerVector(
    targetPower,
    currentBoostedMealPowerVector,
  );
  const deltaMealPowerVector = diff(
    targetMealPowerVector,
    currentBoostedMealPowerVector,
  );
  const deltaMpNorm = norm(deltaMealPowerVector);

  const typeScoreWeight = checkType
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
      currentFlavorBoosts,
      ingredientFlavorBoosts: ing.totalFlavorBoosts,
    });

    const relevantTaste = relativeTasteVector.map((c, i) =>
      mealPowers[i] === targetPower.mealPower || c < 0 ? c : 0,
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
    const postiveTypeNorm = norm(ing.typeVector.map((c) => (c > 0 ? c : 0)));
    const n2 = Math.sqrt(postiveTypeNorm) * deltaTypeNorm;
    const typeProduct =
      checkType && n2 !== 0
        ? innerProduct(ing.typeVector, deltaTypeVector) / n2
        : 0;
    const n3 = deltaLevelNorm;
    const levelProduct =
      n3 !== 0 ? innerProduct(ing.typeVector, deltaLevelVector) / n3 : 0;
    const score =
      mealPowerProduct * mealPowerScoreWeight +
      typeProduct * typeScoreWeight +
      levelProduct * levelScoreWeight;

    if (debug && ing.name === 'Ham') {
      console.debug(
        `${ing.name}: ${score}
    Raw scores: ${mealPowerProduct}, ${typeProduct}, ${levelProduct}
    Relative taste vector: ${relativeTasteVector}
    Boosted meal power vector: ${boostedMealPowerVector}
      n1: ${deltaMpNorm} * ${Math.sqrt(positiveBoostedMpNorm)} = ${n1}
    Type vector: ${ing.typeVector}
      n2: ${deltaTypeNorm} * ${Math.sqrt(postiveTypeNorm)} = ${n2}`,
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

// TODO: target more than one power
export const makeSandwichForPower = (targetPower: Power): Sandwich | null => {
  const checkType = mealPowerHasType(targetPower.mealPower);

  let targetNumHerba = 0;
  if (targetPower.mealPower === 'Sparkling') {
    targetNumHerba = 2;
  } else if (targetPower.mealPower === 'Title') {
    targetNumHerba = 1;
  } else if (targetPower.level === 3) {
    targetNumHerba = 1;
  }

  const targetConfigs = getTargetConfigs(targetPower, targetNumHerba);

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
    mealPowerBoosts: Boosts<MealPower>;
    flavorBoosts: Boosts<Flavor>;
    typeBoosts: Boosts<TypeName>;
    powers: Power[];
    targetPowerFound: boolean;
    boostedMealPower: MealPower | null;
    allowHerbaMystica: boolean;
  };

  const initialState: IngredientSelectionState = {
    fillings: [],
    condiments: [],
    skipIngredients: {},
    baseMealPowerVector: [],
    typeVector: [],
    mealPowerBoosts: {},
    flavorBoosts: {},
    typeBoosts: {},
    powers: [],
    targetPowerFound: false,
    boostedMealPower: null,
    allowHerbaMystica: targetNumHerba > 0,
  };

  const recurse = (state: IngredientSelectionState): Sandwich | null => {
    const {
      fillings,
      condiments,
      skipIngredients,
      flavorBoosts,
      boostedMealPower,
      baseMealPowerVector,
      typeVector,
      typeBoosts,
      targetPowerFound: targetPowerAlreadyFound,
      allowHerbaMystica,
      powers,
      mealPowerBoosts,
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

    // This is the thing that breaks for level 3 powers
    const selectedPower = powers[0];

    const debugCondition = condiments.length === 2 && fillings.length === 0;
    if (debugCondition) {
      console.debug(
        `
    Sandwich so far: ${fillings
      .concat(condiments)
      .map((ing) => ing.name)
      .join(', ')}
    Boosted meal power: ${boostedMealPower}
    Selected `,
      );
    }
    const newIngredientCandidates = selectIngredientCandidates({
      debug: debugCondition,
      targetPower,
      targetConfigs,
      currentBoostedMealPowerVector,
      currentTypeVector: typeVector,
      rankedTypeBoosts: rankTypeBoosts(typeBoosts),
      checkMealPower:
        targetPowerAlreadyFound ||
        selectedPower?.mealPower !== targetPower.mealPower,
      checkType:
        targetPowerAlreadyFound ||
        (checkType && selectedPower?.type !== targetPower.type),
      checkLevel:
        !selectedPower?.level || selectedPower.level < targetPower.level,
      remainingFillings:
        !targetPowerAlreadyFound || fillings.length === 0
          ? maxFillings - fillings.length
          : 0,
      remainingCondiments:
        !targetPowerAlreadyFound || condiments.length === 0
          ? maxCondiments - condiments.length
          : 0,
      currentFlavorBoosts: flavorBoosts,
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

        const newMealPowerBoosts = addBoosts(
          mealPowerBoosts,
          newIngredient.totalMealPowerBoosts,
        );
        const newFlavorBoosts = addBoosts(
          flavorBoosts,
          newIngredient.totalFlavorBoosts,
        );
        const newTypeBoosts = addBoosts(
          typeBoosts,
          newIngredient.totalTypeBoosts,
        );
        const rankedFlavorBoosts = rankFlavorBoosts(newFlavorBoosts);
        const newBoostedMealPower = getBoostedMealPower(rankedFlavorBoosts);

        const newPowers = evaluateBoosts(
          newMealPowerBoosts,
          newBoostedMealPower,
          newTypeBoosts,
        );
        const targetPowerFound = newPowers.some((p) =>
          powersMatch(p, targetPower),
        );
        // if (newCondiments.length === 2 && !targetPowerFound) {
        //   console.debug({
        //     newMealPowerBoosts,
        //     newBoostedMealPower,
        //     newTypeBoosts,
        //     newPowers,
        //     targetPowerFound,
        //   });
        //   throw 'debug';
        // }

        if (
          targetPowerFound &&
          newFillings.length > 0 &&
          newCondiments.length > 0
        ) {
          return {
            fillings: newFillings,
            condiments: newCondiments,
            typeBoosts: newTypeBoosts,
            flavorBoosts: newFlavorBoosts,
            mealPowerBoosts: newMealPowerBoosts,
            powers: newPowers,
          };
        }

        return recurse({
          fillings: newFillings,
          condiments: newCondiments,
          typeBoosts: newTypeBoosts,
          typeVector: add(typeVector, newIngredient.typeVector),
          mealPowerBoosts: newMealPowerBoosts,
          baseMealPowerVector: add(
            baseMealPowerVector,
            newIngredient.baseMealPowerVector,
          ),
          flavorBoosts: newFlavorBoosts,
          powers: newPowers,
          targetPowerFound: targetPowerFound,
          boostedMealPower: newBoostedMealPower,
          skipIngredients: newSkipIngredients,
          allowHerbaMystica:
            allowHerbaMystica &&
            newCondiments.filter((c) => c.isHerbaMystica).length < 2,
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
