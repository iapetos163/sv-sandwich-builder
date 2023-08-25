import {
  Flavor,
  MealPower,
  TypeIndex,
  rangeMealPowers,
  rangeTypes,
} from '@/enum';
import { getFlavorProfilesForPower, isHerbaMealPower } from '@/mechanics';
import { Power } from '@/types';
import {
  getTypeTargetsByPlace,
  fillIn,
  getMealPowerTargetsByPlace,
} from './placement';
import {
  getTargetConfigs,
  permutePowerConfigs,
  TargetConfig,
  TypeAllocation,
} from './target-config';

export { allocationHasMaxes } from './target-config';

export type { TargetConfig };

export interface Target {
  powers: Power[];
  typeAllocation: TypeAllocation;
  configSet: TargetConfig[];
  numHerbaMystica: number;
  typesByPlace: [TypeIndex, TypeIndex | null, TypeIndex | null];
  mealPowersByPlace: (MealPower | null)[];
  boostPower: MealPower | null;
  flavorProfile?: [Flavor, Flavor];
  firstTypeGte: number;
  thirdTypeGte: number;
  firstTypeLte: number;
  /** firstType - secondType > 105 */
  diff105: boolean;
  /** firstTypeAmount - 1.5 * secondTypeAmount >= 70 */
  diff70: boolean;
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
    numHerbaTargets = avoidHerbaMystica ? [2, 1] : [2];
  } else if (targetPowers.some((p) => p.mealPower === MealPower.TITLE)) {
    numHerbaTargets = [1];
  } else if (targetPowers.some((p) => p.level === 2)) {
    numHerbaTargets = [1, 0];
  }

  return numHerbaTargets.flatMap((targetNumHerba) => {
    const targetConfigs = getTargetConfigs(targetPowers, targetNumHerba);
    /**
     * Array of [arrays of configs per target power]
     */
    const targetConfigSets = permutePowerConfigs(targetPowers, targetConfigs);

    return targetConfigSets.flatMap((targetConfigSet): Target[] => {
      const targetTypes = getTypeTargetsByPlace(
        targetPowers,
        targetConfigSet.map((c) => c.typePlaceIndex),
      );

      const typesByPlace = fillIn<TypeIndex>(targetTypes, rangeTypes);

      const mpBase =
        targetNumHerba > 0 ? [MealPower.SPARKLING, MealPower.TITLE] : [];
      const targetMps = getMealPowerTargetsByPlace(
        targetPowers,
        targetConfigSet.map((c) => c.mpPlaceIndex),
        mpBase.length,
      );
      const mealPowersByPlace = [
        ...mpBase,
        ...fillIn<MealPower>(
          targetMps,
          rangeMealPowers.filter((mp) => !isHerbaMealPower(mp)),
        ),
      ];

      const firstTypeGte = targetConfigSet.reduce((max, c) => {
        if (c.firstTypeGt) return Math.max(max, c.firstTypeGt - 1);
        if (c.firstTypeGte) return Math.max(max, c.firstTypeGte);
        if (c.thirdTypeGte) return Math.max(max, c.thirdTypeGte);
        return max;
      }, 0);

      const thirdTypeGte = targetConfigSet.reduce(
        (max, c) => Math.max(max, c.thirdTypeGte || 0),
        0,
      );
      const firstTypeLte = targetConfigSet.reduce(
        (max, c) => Math.max(max, c.firstTypeLte ?? Infinity),
        Infinity,
      );

      const diff70 = targetConfigSet.some((t) => t.diff70);
      const diff105 = targetConfigSet.some((t) => t.diff105);

      const flavorIndependent = targetPowers.every((tp) =>
        isHerbaMealPower(tp.mealPower),
      );

      if (flavorIndependent) {
        return [
          {
            configSet: targetConfigSet,
            typeAllocation: targetConfigSet[0].typeAllocation,
            numHerbaMystica: targetNumHerba,
            powers: targetPowers,
            typesByPlace,
            mealPowersByPlace,
            boostPower: null,
            firstTypeGte,
            thirdTypeGte,
            firstTypeLte,
            diff70,
            diff105,
          },
        ];
      }

      return targetPowers.flatMap((power) => {
        const boostPower = power.mealPower;
        const flavorProfiles = getFlavorProfilesForPower(power.mealPower);
        if (flavorProfiles.length === 0) {
          return [];
        }
        return flavorProfiles.map((flavorProfile) => ({
          configSet: targetConfigSet,
          typeAllocation: targetConfigSet[0].typeAllocation,
          numHerbaMystica: targetNumHerba,
          powers: targetPowers,
          typesByPlace,
          mealPowersByPlace,
          boostPower,
          flavorProfile,
          firstTypeGte,
          thirdTypeGte,
          firstTypeLte,
          diff70,
          diff105,
        }));
      });
    });
  });
};
