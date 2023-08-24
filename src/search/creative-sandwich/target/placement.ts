import { MealPower, TypeIndex } from '@/enum';
import { mealPowerHasType } from '@/mechanics';
import { Power } from '@/types';

/**
 * @returns [index of first type, index of second type, index of third type]
 */
export const getTypeTargetsByPlace = (
  targetPowers: Power[],
  targetPlaceIndices: number[],
): [TypeIndex | null, TypeIndex | null, TypeIndex | null] => {
  const targetFirstPlacePowerIndex = targetPlaceIndices.findIndex(
    (pi) => pi === 0,
  );
  const targetSecondPlacePowerIndex = targetPlaceIndices.findIndex(
    (pi) => pi === 1,
  );
  const targetThirdPlacePowerIndex = targetPlaceIndices.findIndex(
    (pi) => pi === 2,
  );

  const targetFirstPlacePower =
    targetFirstPlacePowerIndex !== undefined
      ? targetPowers[targetFirstPlacePowerIndex]
      : null;
  const targetSecondPlacePower =
    targetSecondPlacePowerIndex !== undefined
      ? targetPowers[targetSecondPlacePowerIndex]
      : null;
  const targetThirdPlacePower =
    targetThirdPlacePowerIndex !== undefined
      ? targetPowers[targetThirdPlacePowerIndex]
      : null;

  let firstTargetType: TypeIndex | null = null;
  let secondTargetType: TypeIndex | null = null;
  let thirdTargetType: TypeIndex | null = null;

  if (
    targetFirstPlacePower &&
    mealPowerHasType(targetFirstPlacePower.mealPower)
  ) {
    firstTargetType = targetFirstPlacePower.type;
  }
  if (
    targetSecondPlacePower &&
    mealPowerHasType(targetSecondPlacePower.mealPower)
  ) {
    secondTargetType = targetSecondPlacePower.type;
  }
  if (
    targetThirdPlacePower &&
    mealPowerHasType(targetThirdPlacePower.mealPower)
  ) {
    thirdTargetType = targetThirdPlacePower.type;
  }

  return [firstTargetType, secondTargetType, thirdTargetType];
};

export const getMealPowerTargetsByPlace = (
  targetPowers: Power[],
  targetPlaceIndices: number[],
  firstIndex = 0,
): [MealPower | null, MealPower | null, MealPower | null] => {
  const targetFirstPlacePowerIndex = targetPlaceIndices.findIndex(
    (pi) => pi === firstIndex,
  );
  const targetSecondPlacePowerIndex = targetPlaceIndices.findIndex(
    (pi) => pi === firstIndex + 1,
  );
  const targetThirdPlacePowerIndex = targetPlaceIndices.findIndex(
    (pi) => pi === firstIndex + 2,
  );

  const targetFirstPlacePower =
    targetFirstPlacePowerIndex !== undefined
      ? targetPowers[targetFirstPlacePowerIndex]
      : null;
  const targetSecondPlacePower =
    targetSecondPlacePowerIndex !== undefined
      ? targetPowers[targetSecondPlacePowerIndex]
      : null;
  const targetThirdPlacePower =
    targetThirdPlacePowerIndex !== undefined
      ? targetPowers[targetThirdPlacePowerIndex]
      : null;

  const firstTargetMp = targetFirstPlacePower?.mealPower ?? null;
  const secondTargetMp = targetSecondPlacePower?.mealPower ?? null;
  const thirdTargetMp = targetThirdPlacePower?.mealPower ?? null;

  return [firstTargetMp, secondTargetMp, thirdTargetMp];
};

export const fillIn = <T>(
  arr: [T | null, T | null, T | null],
  selection: T[],
): [T, T, T] => {
  let [first, second, third] = arr;

  if (first === null) {
    first = selection.find((t) => t !== first && t !== second && t !== third)!;
  }
  if (second === null) {
    second = selection.find((t) => t !== first && t !== second && t !== third)!;
  }
  if (third === null) {
    third = selection.find((t) => t !== first && t !== second && t !== third)!;
  }

  return [first, second, third];
};
