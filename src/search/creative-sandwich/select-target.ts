import { ingredientMatrix } from '../../data';
import { MealPower, rangeMealPowers } from '../../enum';
import { createMetaVector } from '../../metavector';
import { Power } from '../../types';
import { applyTransform } from '../../vector-math';
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
  powers: Power[];
  configSet: TargetConfig[];
  numHerbaMystica: number;
  transformedTargetMetaVector: number[];
}

export interface SelectInitialTargetsProps {
  targetPowers: Power[];
  /** @default true */
  avoidHerbaMystica?: boolean;
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
// /** @default false */
// multiplayer?: boolean;
// }

// const CONDIMENT_SCORE = 1;
// const FILLING_SCORE = 5;
// const DEFAULT_HERBA_SCORE = 35;

// const HERBA_SCORE = avoidHerbaMystica ? DEFAULT_HERBA_SCORE : CONDIMENT_SCORE;

export const selectInitialTargets = ({
  targetPowers,
  avoidHerbaMystica = true,
}: SelectInitialTargetsProps): Target[] => {
  let numHerbaTargets = [0];
  if (targetPowers.some((p) => p.mealPower === MealPower.SPARKLING)) {
    numHerbaTargets = [2];
  } else if (targetPowers.some((p) => p.level === 3)) {
    numHerbaTargets = avoidHerbaMystica ? [1, 2] : [2];
  } else if (targetPowers.some((p) => p.mealPower === MealPower.TITLE)) {
    numHerbaTargets = [1];
  } else if (targetPowers.some((p) => p.level === 2)) {
    numHerbaTargets = [0, 1];
  }

  return numHerbaTargets.reduce<Target[]>((accum1, targetNumHerba) => {
    const targetConfigs = getTargetConfigs(targetPowers, targetNumHerba);
    /**
     * Array of [arrays of configs per target power]
     */
    const targetConfigSets = permutePowerConfigs(targetPowers, targetConfigs);

    return targetConfigSets.reduce<Target[]>((accum, targetConfigSet) => {
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

      return rangeMealPowers.reduce<Target[]>((targets, boostPower) => {
        if (
          boostPower === MealPower.SPARKLING ||
          boostPower === MealPower.TITLE
        ) {
          return targets;
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

        return [
          ...targets,
          {
            transformedTargetMetaVector,
            configSet: targetConfigSet,
            numHerbaMystica: targetNumHerba,
            powers: targetPowers,
          },
        ];
      }, accum);
    }, accum1);
  }, []);
};
