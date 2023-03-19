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
  /** Only used to adjust target amounts. */
  boostPower?: MealPower | null;
}

export const getTargetMealPowerVector = ({
  targetPowers,
  targetConfigSet,
  rankedMealPowerBoosts,
  mealPowerVector: currentVector,
  boostPower = null,
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
      const mpToBeat = currentBoostAtTargetPlace?.mealPower ?? null;
      const amountToBeat =
        (currentBoostAtTargetPlace?.amount ?? 0) +
        (boostPower !== null && mpToBeat === boostPower ? 100 : 0);
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

  // const boostingMpAmountIndex = targetMpAmounts.findIndex(
  //   ([mp]) => mp === boostPower,
  // );
  // if (boostingMpAmountIndex >= 0) {
  //   const [mp, currentAmount] = targetMpAmounts[boostingMpAmountIndex];
  //   const nextMpAmount = targetMpAmounts[boostingMpAmountIndex + 1];
  //   if (!nextMpAmount) {
  //     targetMpAmounts[boostingMpAmountIndex] = [
  //       mp,
  //       Math.max(100, currentAmount),
  //     ];
  //   } else {
  //     const [nextMp, nextAmount] = nextMpAmount;
  //     targetMpAmounts[boostingMpAmountIndex] = [
  //       mp,
  //       Math.max(
  //         Math.min(100, nextMp < mp ? nextAmount : nextAmount - 1),
  //         currentAmount,
  //       ),
  //     ];
  //   }
  // }

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
  boostedPower: MealPower | null,
) =>
  mealPowerVector.map((c, mp) =>
    mp === boostedPower ? Math.max(c - 100, 0) : c,
  );
