import { MealPower, TypeIndex } from '../../../enum';
import { Power } from '../../../types';
import {
  getTargetConfigs,
  getTypeTargetsByPlace,
  permutePowerConfigs,
  TargetConfig,
} from './target-config';

export { allocationHasMaxes } from './target-config';

export type { TargetConfig };

export interface Target {
  powers: Power[];
  configSet: TargetConfig[];
  numHerbaMystica: number;
  typesByPlace: [TypeIndex, TypeIndex, TypeIndex];
  boostPower: MealPower | null;
}

export interface SelectInitialTargetsProps {
  targetPowers: Power[];
  /** @default true */
  avoidHerbaMystica?: boolean;
}

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

      const flavorIndependent = targetPowers.every(
        (tp) =>
          tp.mealPower === MealPower.SPARKLING ||
          tp.mealPower === MealPower.TITLE,
      );

      if (flavorIndependent) {
        return [
          {
            configSet: targetConfigSet,
            numHerbaMystica: targetNumHerba,
            powers: targetPowers,
            typesByPlace: targetTypes,
            boostPower: null,
          },
        ];
      }

      return targetPowers.reduce<Target[]>((targets, power) => {
        const boostPower = power.mealPower;
        if (
          boostPower === MealPower.SPARKLING ||
          boostPower === MealPower.TITLE
        ) {
          return targets;
        }

        return [
          ...targets,
          {
            configSet: targetConfigSet,
            numHerbaMystica: targetNumHerba,
            powers: targetPowers,
            typesByPlace: targetTypes,
            boostPower,
          },
        ];
      }, accum);
    }, accum1);
  }, []);
};
