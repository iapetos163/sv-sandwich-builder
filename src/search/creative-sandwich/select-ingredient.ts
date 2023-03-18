import { ingredients } from '../../data';
import {
  rankTypeBoosts,
  rankMealPowerBoosts,
  rankFlavorBoosts,
} from '../../mechanics';
import { createMetaVector } from '../../metavector';
import { Ingredient } from '../../types';
import { diff, innerProduct, norm, normSquared } from '../../vector-math';
import { Target } from './target/index';
import {
  adjustMealPowerTargetForFlavorBoost,
  getTargetFlavorVectors,
  getTargetMealPowerVector,
  getTargetTypeVector,
} from './vector';

const INGREDIENT_SCORE_THRESHOLD = 0.2;
const CONDIMENT_SCORE = 1;
const FILLING_SCORE = 5;
const DEFAULT_HERBA_SCORE = 35;
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

/** @deprecated */
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

/** @deprecated */
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

type ScoredIngredient = Ingredient & {
  score: number;
  scoredProduct: number;
};

export interface SelectIngredientProps {
  target: Target;
  currentMealPowerVector: number[];
  currentTypeVector: number[];
  currentFlavorVector: number[];
  remainingFillings: number;
  remainingCondiments: number;
  remainingHerba: number;
  skipIngredients: Record<string, boolean>;
  debug?: boolean;
  /** @default true */
  avoidHerbaMystica?: boolean;
  needFilling: boolean;
  needCondiment: boolean;
}

export const selectIngredientCandidates = ({
  target,
  currentMealPowerVector,
  currentTypeVector,
  currentFlavorVector,
  skipIngredients,
  remainingHerba,
  remainingCondiments,
  remainingFillings,
  needCondiment,
  needFilling,
  avoidHerbaMystica = true,
  debug,
}: SelectIngredientProps): ScoredIngredient[] => {
  const internalFillingScore = needFilling ? CONDIMENT_SCORE : FILLING_SCORE;
  const HERBA_SCORE = DEFAULT_HERBA_SCORE; // avoidHerbaMystica ? DEFAULT_HERBA_SCORE : CONDIMENT_SCORE;

  const currentMetaVector = createMetaVector({
    mealPowerVector: currentMealPowerVector,
    typeVector: currentTypeVector,
    flavorVector: currentFlavorVector,
  });

  const rankedTypeBoosts = rankTypeBoosts(currentTypeVector);
  const rankedMealPowerBoosts = rankMealPowerBoosts(currentMealPowerVector);
  const rankedFlavorBoosts = rankFlavorBoosts(currentFlavorVector);

  const targetMealPowerVector = getTargetMealPowerVector({
    targetPowers: target.powers,
    targetConfigSet: target.configSet,
    rankedMealPowerBoosts,
    mealPowerVector: currentMealPowerVector,
  });
  const adjustedTargetMealPowerVector = adjustMealPowerTargetForFlavorBoost(
    targetMealPowerVector,
    target.boostPower,
  );

  const targetTypeVector = getTargetTypeVector({
    targetPowers: target.powers,
    targetConfigSet: target.configSet,
    rankedTypeBoosts,
    targetTypes: target.typesByPlace,
    typeVector: currentTypeVector,
  });

  const targetFlavorVector =
    target.boostPower !== null
      ? getTargetFlavorVectors({
          flavorVector: currentFlavorVector,
          boostPower: target.boostPower,
          rankedFlavorBoosts,
        })[0]
      : currentFlavorVector;

  const targetMetaVector = createMetaVector({
    mealPowerVector: adjustedTargetMealPowerVector,
    typeVector: targetTypeVector,
    flavorVector: targetFlavorVector,
  });

  let deltaMetaVector = diff(targetMetaVector, currentMetaVector);
  const deltaNorm = norm(deltaMetaVector);

  if (deltaNorm === Infinity) {
    if (debug) {
      console.debug('Cannot satisfy constraints for target configs', {
        targetTypeVector,
        currentTypeVector,
        target,
      });
    }
    return [];
  }
  // In the case we are forced to pick an ingredient but we have what we need
  // Force a nonzero deltaTypeVector
  else if (deltaNorm === 0) {
    const newTargetTypeVector = getTargetTypeVector({
      targetPowers: target.powers,
      targetConfigSet: target.configSet,
      targetTypes: target.typesByPlace,
      rankedTypeBoosts,
      typeVector: currentTypeVector,
      forceDiff: true,
    });
    const newTargetMetaVector = createMetaVector({
      mealPowerVector: adjustedTargetMealPowerVector,
      typeVector: newTargetTypeVector,
      flavorVector: targetFlavorVector,
    });
    deltaMetaVector = diff(newTargetMetaVector, currentMetaVector);
    // todo: make this recursive?
  }

  const minProduct =
    1 / (remainingFillings + remainingCondiments + remainingHerba);

  const { chosenIngredients } = ingredients.reduce<{
    chosenIngredients: ScoredIngredient[];
    highestScoredProduct: number;
  }>(
    (
      { chosenIngredients, highestScoredProduct },
      ing,
    ): {
      chosenIngredients: ScoredIngredient[];
      highestScoredProduct: number;
    } => {
      if (
        (remainingFillings <= 0 && ing.ingredientType === 'filling') ||
        (remainingCondiments <= 0 &&
          ing.ingredientType === 'condiment' &&
          !ing.isHerbaMystica) ||
        (remainingHerba <= 0 && ing.isHerbaMystica) ||
        skipIngredients[ing.name]
      ) {
        return { chosenIngredients, highestScoredProduct };
      }

      // const adjustedMetaVector = ing.metaVector.map((c, i) =>
      //   targetMetaVector[i] > 0 ? c : 0,
      // );

      const product =
        innerProduct(ing.metaVector, deltaMetaVector) /
        normSquared(deltaMetaVector);

      const [scoredProduct, score] =
        ing.ingredientType === 'filling'
          ? [product / internalFillingScore, FILLING_SCORE]
          : [
              product / CONDIMENT_SCORE,
              ing.isHerbaMystica ? HERBA_SCORE : CONDIMENT_SCORE,
            ];

      if (debug && (ing.name === 'Jam' || ing.name === 'Vinegar')) {
        console.debug({ name: ing.name, product, scoredProduct });
      }
      if (
        product < minProduct ||
        scoredProduct < highestScoredProduct * (1 - INGREDIENT_SCORE_THRESHOLD)
      ) {
        return { chosenIngredients, highestScoredProduct };
      }

      if (scoredProduct < highestScoredProduct) {
        return {
          chosenIngredients: [
            ...chosenIngredients,
            { ...ing, score, scoredProduct },
          ],
          highestScoredProduct,
        };
      }

      const newMinScoredProduct =
        scoredProduct * (1 - INGREDIENT_SCORE_THRESHOLD);
      return {
        chosenIngredients: [
          ...chosenIngredients.filter(
            (i) =>
              i.scoredProduct >= newMinScoredProduct ||
              (!needCondiment &&
                needFilling &&
                i.ingredientType === 'filling' &&
                i.scoredProduct >= 1) ||
              (!needFilling &&
                needCondiment &&
                i.ingredientType === 'condiment' &&
                i.scoredProduct >= 1),
          ),
          { ...ing, score, scoredProduct },
        ],
        highestScoredProduct: scoredProduct,
      };
    },
    { chosenIngredients: [], highestScoredProduct: 0 },
  );

  if (debug) {
    console.debug(
      `New ingredient candidates: ${[
        '',
        ...chosenIngredients.map(
          (i) => `${i.name} ${i.score} ${i.scoredProduct}`,
        ),
      ].join('\n  ')}
      Delta Target: ${deltaMetaVector.join(' ')}`,
    );
  }

  return chosenIngredients;
};
