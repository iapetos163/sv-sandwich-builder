import { ingredientMatrix, ingredients } from '../../data';
import { MealPower, rangeFlavors, rangeMealPowers } from '../../enum';
import { getBoostedMealPower } from '../../mechanics/taste';
import { createMetaVector } from '../../metavector';
import { Power } from '../../types';
import { applyTransform, innerProduct } from '../../vector-math';
import {
  getTargetConfigs,
  getTypeTargetsByPlace,
  permutePowerConfigs,
  TargetConfig,
} from './target';
import {
  adjustMealPowerTargetForFlavorBoost,
  getTargetMealPowerVector,
} from './vector/meal-power';
import { getTargetFlavorVector } from './vector/taste';
import { getTargetTypeVector } from './vector/type-vector';

export interface Target {
  configSet: TargetConfig[];
  numHerbaMystica: number;
  transformedTargetMetaVector: number[];
}

export interface SelectInitialTargetsProps {
  targetPowers: Power[];
  /** @default true */
  avoidHerbaMystica?: boolean;
  /** @default false */
  multiplayer?: boolean;
}

// export interface SelectTargetsProps {
//   targetPowers: Power[];
//   mealPowerVector: number[];
//   typeVector: number[];
//   flavorVector: number[];
//   /** @default true */
//   avoidHerbaMystica?: boolean;
//   remainingFillings: number;
//   remainingCondiments: number;
//   remainingHerba: number;
// }

const CONDIMENT_SCORE = 1;
const FILLING_SCORE = 5;
const DEFAULT_HERBA_SCORE = 35;
const SCORE_THRESHOLD = 0.2;

export const selectInitialTargets = ({
  targetPowers,
  avoidHerbaMystica = true,
  multiplayer = false,
}: SelectInitialTargetsProps): Target[] => {
  const HERBA_SCORE = avoidHerbaMystica ? DEFAULT_HERBA_SCORE : CONDIMENT_SCORE;
  const MAX_FILLINGS = multiplayer ? 12 : 6;
  const MAX_CONDIMENTS = multiplayer ? 8 : 4;
  const MAX_PIECES = multiplayer ? 15 : 12;

  let targetNumHerba = 0;
  if (targetPowers.some((p) => p.mealPower === MealPower.SPARKLING)) {
    targetNumHerba = 2;
  } else if (targetPowers.some((p) => p.level === 3)) {
    targetNumHerba = avoidHerbaMystica ? 1 : 2;
  } else if (targetPowers.some((p) => p.mealPower === MealPower.TITLE)) {
    targetNumHerba = 1;
  }

  const targetConfigs = getTargetConfigs(targetPowers, targetNumHerba);
  /**
   * Array of [arrays of configs per target power]
   */
  const targetConfigSets = permutePowerConfigs(targetPowers, targetConfigs);

  const { leastScore, targets } = targetConfigSets.reduce<{
    leastScore: number;
    targets: Target[];
  }>(
    (accum, targetConfigSet) => {
      const targetTypes = getTypeTargetsByPlace(
        targetPowers,
        targetConfigSet.map((c) => c.typePlaceIndex),
        [],
      );

      const targetMealPowerVector = getTargetMealPowerVector({
        targetPowers,
        targetConfigSet,
        rankedMealPowerBoosts: [],
        mealPowerVector: [],
      });

      const targetTypeVector = getTargetTypeVector({
        targetPowers,
        targetConfigSet,
        targetTypes,
        rankedTypeBoosts: [],
        typeVector: [],
      });

      return rangeMealPowers.reduce<{ leastScore: number; targets: Target[] }>(
        ({ leastScore, targets }, boostPower) => {
          if (
            boostPower === MealPower.SPARKLING ||
            boostPower === MealPower.TITLE
          ) {
            return { leastScore, targets };
          }

          const targetFlavorVector = getTargetFlavorVector({
            flavorVector: [],
            boostPower,
            rankedFlavorBoosts: [],
          });

          const adjustedMealPowerVector = adjustMealPowerTargetForFlavorBoost(
            targetMealPowerVector,
            boostPower,
          );

          const metaVector = createMetaVector({
            mealPowerVector: adjustedMealPowerVector,
            typeVector: targetTypeVector,
            flavorVector: targetFlavorVector,
          });

          const transformedTargetMetaVector = applyTransform(
            ingredientMatrix,
            metaVector,
          );

          const ingData = ingredients.map(
            ({ metaVector, isHerbaMystica, ingredientType }, index) => {
              const adjustedIngMetaVector = metaVector.map((c, j) =>
                (metaVector[j] ?? 0) > 0 ? c : 0,
              );

              const transformedIngMetaVector = applyTransform(
                ingredientMatrix,
                adjustedIngMetaVector,
              );
              const product = innerProduct(
                transformedTargetMetaVector,
                transformedIngMetaVector,
              );

              return {
                // isHerbaMystica, ingredientType,
                index,
                product,
                score:
                  ingredientType === 'filling'
                    ? FILLING_SCORE
                    : isHerbaMystica
                    ? HERBA_SCORE
                    : CONDIMENT_SCORE,
              };
            },
          );

          ingData.sort((a, b) => a.scoredProduct - b.scoredProduct);

          const {};
        },
        accum,
      );
    },
    {
      leastScore: Infinity,
      targets: [],
    },
  );

  return targets;
};
