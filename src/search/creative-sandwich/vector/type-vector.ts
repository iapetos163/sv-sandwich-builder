import { rangeTypes, TypeIndex } from '../../../enum';
import { rankTypeBoosts, TypeBoost } from '../../../mechanics';
import { Power } from '../../../types';
import { TargetConfig } from '../target';

/**
 * @returns Array of [type, typePlaceIndex] by descending typePlaceIndex
 */
const sortTargetTypesByPlace = (
  targetTypes: TypeIndex[],
  typePlaceIndices: number[],
): [TypeIndex, number][] => {
  const indices = typePlaceIndices.map((c, i) => i);
  indices.sort((a, b) => typePlaceIndices[b] - typePlaceIndices[a]);
  return indices.map((i) => [targetTypes[i], typePlaceIndices[i]]);
};

const getTargetTypeVectorForPosition = (
  targetTypes: TypeIndex[],
  targetPlaceIndexSet: number[],
  currentRankedTypes: TypeBoost[],
  currentVector: number[],
) => {
  const sortedPowerPlaceIndexes = sortTargetTypesByPlace(
    targetTypes,
    targetPlaceIndexSet,
  );

  const [targetVector] = sortedPowerPlaceIndexes.reduce<
    [number[], TypeBoost[]]
  >(
    ([currentVector, currentRankedTypes], [targetType, targetPlaceIndex]) => {
      const currentPlaceIndex = currentRankedTypes.findIndex(
        (t) => t.type === targetType,
      );

      // Target type is at desired rank
      if (currentPlaceIndex === targetPlaceIndex) {
        return [currentVector, currentRankedTypes];
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
        const newTargetVector = rangeTypes.map((t) => {
          if (typesAhead.includes(t)) {
            return Math.max(
              currentVector[t] ?? 0,
              currentTargetPlaceAmount + 2,
            );
          }
          if (t === targetType) {
            return currentTargetPlaceAmount + 1;
          }
          return currentVector[t] ?? 0;
        });
        return [newTargetVector, rankTypeBoosts(newTargetVector)];
      }

      // Target type is ahead of desired rank
      const currentTargetTypeAmount =
        currentRankedTypes[currentPlaceIndex].amount;

      let typesBehind = currentRankedTypes
        .slice(currentPlaceIndex + 1, targetPlaceIndex + 1)
        .map((rt) => rt.type);
      if (typesBehind.length < targetPlaceIndex - currentPlaceIndex) {
        typesBehind = typesBehind
          .concat(rangeTypes)
          .filter((t) => t !== targetType)
          .slice(0, targetPlaceIndex - currentPlaceIndex);
      }

      const newTargetVector = rangeTypes.map((t) => {
        if (typesBehind.includes(t)) {
          return Math.max(currentTargetTypeAmount + 1, currentVector[t] ?? 0);
        }
        return currentVector[t] ?? 0;
      });
      return [newTargetVector, rankTypeBoosts(newTargetVector)];
    },
    [currentVector, currentRankedTypes],
  );

  return targetVector;
};

export interface GetTargetTypeVectorProps {
  targetPowers: Power[];
  targetConfigSet: TargetConfig[];
  targetTypes: [TypeIndex, TypeIndex, TypeIndex];
  rankedTypeBoosts: TypeBoost[];
  typeVector: number[];
  forceDiff?: boolean;
}

export const getTargetTypeVector = ({
  targetPowers,
  targetConfigSet,
  targetTypes,
  rankedTypeBoosts: currentRankedTypes,
  typeVector: currentVector,
  forceDiff = false,
}: GetTargetTypeVectorProps) => {
  const initialTargetVector = getTargetTypeVectorForPosition(
    targetPowers.map((p) => p.type),
    targetConfigSet.map((c) => c.typePlaceIndex),
    currentRankedTypes,
    currentVector,
  );
  const tentativeTargetVector = getTargetLevelVector({
    targetPowers,
    targetConfigSet,
    targetTypes,
    typeVector: initialTargetVector,
  });

  // Every member of targetConfigSet has the same typeAllocation
  const allocation = targetConfigSet[0].typeAllocation;

  const [currentFirstType, currentSecondType] = currentRankedTypes;
  const currentFirstAmount = currentFirstType?.amount ?? 0;
  const currentSecondAmount = currentSecondType?.amount ?? 0;
  const [firstTargetIndex, secondTargetIndex] = targetTypes;
  const targetFirstAmount = tentativeTargetVector[firstTargetIndex];
  const targetSecondAmount = tentativeTargetVector[secondTargetIndex];
  let minFirstAmount = 0;
  let maxFirstAmount = Infinity;
  let maxSecondAmount = Infinity;
  if (allocation === 'ONE_ONE_ONE') {
    minFirstAmount = 481;
  } else if (allocation === 'ONE_ONE_THREE') {
    minFirstAmount = 106;
    maxSecondAmount = Math.max(targetFirstAmount, minFirstAmount) - 106;
    if (targetSecondAmount > maxSecondAmount) {
      minFirstAmount = 281;
      maxSecondAmount = Infinity;
    }
  } else if (allocation === 'ONE_THREE_ONE') {
    maxFirstAmount = 105;
    maxSecondAmount = 21;
    if (targetSecondAmount <= 5) {
      minFirstAmount = Math.max(targetSecondAmount + 72, 74);
    } else if (targetSecondAmount <= 9) {
      minFirstAmount = Math.max(targetSecondAmount + 74, 80);
    } else if (targetSecondAmount <= 16) {
      minFirstAmount = Math.max(targetSecondAmount + 78, 90);
    } else if (targetSecondAmount <= 21) {
      minFirstAmount = Math.max(targetSecondAmount + 80, 100);
    }
  }

  if (
    targetFirstAmount > maxFirstAmount ||
    currentFirstAmount > maxFirstAmount ||
    currentSecondAmount > maxSecondAmount ||
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
  { mpPlaceIndex, typePlaceIndex, typeAllocation }: TargetConfig,
): [number, number, number] => {
  if (typeAllocation === 'ONE_ONE_ONE') {
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

interface GetTargetLevelVectorProps {
  targetPowers: Power[];
  targetConfigSet: TargetConfig[];
  targetTypes: [TypeIndex, TypeIndex, TypeIndex];
  typeVector: number[];
}

const getTargetLevelVector = ({
  targetPowers,
  targetConfigSet,
  targetTypes: [firstTargetIndex, secondTargetIndex, thirdTargetIndex],
  typeVector: currentVector,
}: GetTargetLevelVectorProps) => {
  const mins = targetConfigSet.map((c, i) =>
    getMinRankedTypeAmounts(targetPowers[i], c),
  );
  const minFirstTarget = Math.max(...mins.map((m) => m[0]));
  const minSecondTarget = Math.max(...mins.map((m) => m[1]));
  const minThirdTarget = Math.max(...mins.map((m) => m[2]));

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
