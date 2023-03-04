import { MealPower, rangeMealPowers } from '../../../enum';
import { MealPowerBoost } from '../../../mechanics';
import { Power } from '../../../types';
import { TargetConfig } from '../target';

/**
 * @returns Array of [power, mpPlaceIndex] by descending mpPlaceIndex
 */
export const sortTargetPowersByMpPlace = (
  targetPowers: Power[],
  targetConfigSet: TargetConfig[],
): [Power, number][] => {
  const indices = targetConfigSet.map((c, i) => i);
  indices.sort(
    (a, b) => targetConfigSet[b].mpPlaceIndex - targetConfigSet[a].mpPlaceIndex,
  );
  return indices.map((i) => [targetPowers[i], targetConfigSet[i].mpPlaceIndex]);
};

export interface GetTargetMealPowerVectorProps {
  targetPowers: Power[];
  targetConfigSet: TargetConfig[];
  rankedMealPowerBoosts: MealPowerBoost[];
  mealPowerVector: number[];
}

export const getTargetMealPowerVector = ({
  targetPowers,
  targetConfigSet,
  rankedMealPowerBoosts,
  mealPowerVector: currentVector,
}: GetTargetMealPowerVectorProps) => {
  const sortedPowerPlaceIndexes = sortTargetPowersByMpPlace(
    targetPowers,
    targetConfigSet,
  );

  const targetMpAmounts = sortedPowerPlaceIndexes.reduce<[MealPower, number][]>(
    (mpAmounts, [targetPower, placeIndex], i) => {
      const lastMpAmount = mpAmounts[i - 1];
      const lastAmount = lastMpAmount ? lastMpAmount[1] : 0;
      const currentBoostAtTargetPlace = rankedMealPowerBoosts[placeIndex];
      const mpToBeat = currentBoostAtTargetPlace?.mealPower ?? placeIndex;
      const amountToBeat = currentBoostAtTargetPlace?.amount ?? 0;
      return [
        ...mpAmounts,
        [
          targetPower.mealPower,
          Math.max(
            lastAmount + 1,
            mpToBeat > targetPower.mealPower
              ? Math.max(amountToBeat, 1)
              : amountToBeat + 1,
          ),
        ],
      ];
    },
    [],
  );

  return rangeMealPowers.map((mp) => {
    const targetMatch = targetMpAmounts.find(([tmp]) => tmp === mp);
    if (!targetMatch) return currentVector[mp] ?? 0;
    const [, targetAmount] = targetMatch;
    return targetAmount;
  });
};

export const boostMealPowerVector = (v: number[], boostedPower: MealPower) =>
  rangeMealPowers.map((mp) =>
    mp === boostedPower ? (v[mp] ?? 0) + 100 : v[mp],
  );

export const adjustMealPowerTargetForFlavorBoost = (
  mealPowerVector: number[],
  boostedPower: MealPower,
) =>
  mealPowerVector.map((c, mp) =>
    mp === boostedPower ? Math.max(c - 100, 0) : c,
  );
