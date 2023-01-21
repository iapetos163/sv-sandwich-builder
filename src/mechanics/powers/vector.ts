import { MealPower, rangeMealPowers, rangeTypes, TypeIndex } from '../../enum';
import { Power } from '../../types';
import { MealPowerBoost, TargetConfig, TypeBoost } from './index';

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

/**
 * @returns Array of [power, typePlaceIndex] by descending typePlaceIndex
 */
const sortTargetPowersByTypePlace = (
  targetPowers: Power[],
  targetConfigSet: TargetConfig[],
): [Power, number][] => {
  const indices = targetConfigSet.map((c, i) => i);
  indices.sort(
    (a, b) =>
      targetConfigSet[b].typePlaceIndex - targetConfigSet[a].typePlaceIndex,
  );
  return indices.map((i) => [
    targetPowers[i],
    targetConfigSet[i].typePlaceIndex,
  ]);
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

const getTargetTypeVectorForPosition = (
  targetType: TypeIndex,
  targetPlaceIndex: number,
  currentRankedTypes: TypeBoost[],
  currentVector: number[],
) => {
  const currentPlaceIndex = currentRankedTypes.findIndex(
    (t) => t.type === targetType,
  );

  // Target type is at desired rank
  if (currentPlaceIndex === targetPlaceIndex) {
    return currentVector;
  }

  const currentTargetPlaceAmount =
    currentRankedTypes[targetPlaceIndex]?.amount || 0;

  let typesAhead = currentRankedTypes
    .slice(0, targetPlaceIndex)
    .map((rt) => rt.type);

  if (typesAhead.length < targetPlaceIndex) {
    typesAhead = typesAhead
      .concat(rangeTypes)
      .filter((t) => t !== targetType)
      .slice(0, targetPlaceIndex);
  }

  // Target type is behind desired rank
  if (currentPlaceIndex < 0 || currentPlaceIndex > targetPlaceIndex) {
    return rangeTypes.map((t) => {
      if (typesAhead.includes(t)) {
        return Math.max(currentVector[t] ?? 0, currentTargetPlaceAmount + 2);
      }
      if (t === targetType) {
        return currentTargetPlaceAmount + 1;
      }
      return currentVector[t] ?? 0;
    });
  }

  // Target type is ahead of desired rank
  const currentTargetTypeAmount = currentRankedTypes[currentPlaceIndex].amount;

  let typesBehind = currentRankedTypes
    .slice(currentPlaceIndex + 1, targetPlaceIndex + 1)
    .map((rt) => rt.type);
  if (typesBehind.length < targetPlaceIndex - currentPlaceIndex) {
    typesBehind = typesBehind
      .concat(rangeTypes)
      .filter((t) => t !== targetType)
      .slice(0, targetPlaceIndex - currentPlaceIndex);
  }

  return rangeTypes.map((t) => {
    if (typesBehind.includes(t)) {
      return Math.max(currentTargetTypeAmount + 1, currentVector[t] ?? 0);
    }
    return currentVector[t] ?? 0;
  });
};

export interface GetTargetTypeVectorProps {
  targetPower: Power;
  targetConfig: TargetConfig;
  targetTypeIndices: [number, number, number];
  rankedTypeBoosts: TypeBoost[];
  typeVector: number[];
  forceDiff?: boolean;
}

export const getTargetTypeVector = ({
  targetPower: { type: targetType },
  targetConfig: { typePlaceIndex: targetPlaceIndex, config },
  targetTypeIndices: [firstTargetIndex, secondTargetIndex],
  rankedTypeBoosts: currentRankedTypes,
  typeVector: currentVector,
  forceDiff = false,
}: GetTargetTypeVectorProps) => {
  const tentativeTargetVector = getTargetTypeVectorForPosition(
    targetType,
    targetPlaceIndex,
    currentRankedTypes,
    currentVector,
  );

  const targetFirstAmount = tentativeTargetVector[firstTargetIndex];
  const targetSecondAmount = tentativeTargetVector[secondTargetIndex];
  let minFirstAmount = 0;
  let maxFirstAmount = Infinity;
  let maxSecondAmount = Infinity;
  if (config === 'ONE_ONE_ONE') {
    minFirstAmount = 481;
  } else if (config === 'ONE_ONE_THREE') {
    minFirstAmount = 106;
    maxSecondAmount = Math.max(targetFirstAmount, minFirstAmount) - 106;
    if (targetSecondAmount > maxSecondAmount) {
      minFirstAmount = 281;
      maxSecondAmount = Infinity;
    }
  } else if (config === 'ONE_THREE_ONE') {
    maxFirstAmount = 105;
    if (targetSecondAmount >= 100) {
      maxSecondAmount = 21;
      minFirstAmount = targetSecondAmount + 80;
    } else if (targetSecondAmount >= 90) {
      maxSecondAmount = 16;
      minFirstAmount = targetSecondAmount + 78;
    } else if (targetSecondAmount >= 80) {
      maxSecondAmount = 9;
      minFirstAmount = targetSecondAmount + 74;
    } else if (targetSecondAmount >= 74) {
      maxSecondAmount = 5;
      minFirstAmount = targetSecondAmount + 72;
    }
  }

  if (
    targetFirstAmount > maxFirstAmount ||
    targetSecondAmount > maxSecondAmount
  ) {
    return tentativeTargetVector.map((c, i) =>
      i === firstTargetIndex || i === secondTargetIndex ? Infinity : c,
    );
  }
  return tentativeTargetVector.map((c, i) => {
    if (i === firstTargetIndex) {
      const amount = Math.max(c, minFirstAmount);
      return amount + (forceDiff && amount === (currentVector[i] || 0) ? 1 : 0);
    }
    return c;
  });
};

const getMinRankedTypeAmounts = (
  targetPower: Power,
  { mpPlaceIndex, typePlaceIndex, config }: TargetConfig,
): [number, number, number] => {
  if (config === 'ONE_ONE_ONE') {
    return [380, 380, 380];
    // OR 460, 0, 0
  }
  if (targetPower.level === 3 && typePlaceIndex >= 2) {
    return [380, 1, 1];
  }
  if (targetPower.level === 3 && typePlaceIndex === 1) {
    return [380, 1, 0];
  }
  if (targetPower.level === 3) {
    return [380, 0, 0];
  }
  if (targetPower.level === 2 && mpPlaceIndex >= 2) {
    return [281, 180, 180];
    // OR 380, 0, 0
  }
  if (targetPower.level === 2 && mpPlaceIndex === 1) {
    return [180, 180, 180];
    // OR 281, 0, 0
  }
  if (targetPower.level === 2 && typePlaceIndex >= 2) {
    return [180, 1, 1];
  }
  if (targetPower.level === 2 && typePlaceIndex === 1) {
    return [180, 1, 0];
  }
  if (targetPower.level === 2) {
    return [180, 0, 0];
  }
  if (typePlaceIndex >= 2) {
    return [1, 1, 1];
  }
  if (typePlaceIndex === 1) {
    return [1, 1, 0];
  }
  return [1, 0, 0];
};

export interface GetTargetLevelVectorProps {
  targetPower: Power;
  targetConfig: TargetConfig;
  targetTypeIndices: [number, number, number];
  typeVector: number[];
}

export const getTargetLevelVector = ({
  targetPower,
  targetConfig,
  targetTypeIndices: [firstTargetIndex, secondTargetIndex, thirdTargetIndex],
  typeVector: currentVector,
}: GetTargetLevelVectorProps) => {
  const [minFirstTarget, minSecondTarget, minThirdTarget] =
    getMinRankedTypeAmounts(targetPower, targetConfig);

  return rangeTypes.map((t) => {
    if (t === firstTargetIndex) {
      return Math.max(minFirstTarget, currentVector[t] || 0);
    }
    if (t === secondTargetIndex) {
      return Math.max(minSecondTarget, currentVector[t] || 0);
    }
    if (t === thirdTargetIndex) {
      return Math.max(minThirdTarget, currentVector[t] || 0);
    }
    return currentVector[t] || 0;
  });
};

export const boostMealPowerVector = (v: number[], boostedPower: MealPower) =>
  rangeMealPowers.map((mp) =>
    mp === boostedPower ? (v[mp] ?? 0) + 100 : v[mp],
  );
