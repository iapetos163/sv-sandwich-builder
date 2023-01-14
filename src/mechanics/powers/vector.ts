import { allTypes, MealPower, mealPowers, TypeName } from '../../strings';
import { Power } from '../../types';
import { mealPowerHasType, TargetConfig, TypeBoost } from './index';

export const getTargetMealPowerVector = (
  power: Power,
  currentVector: number[],
) => {
  const target = Math.max(0, ...currentVector) + 1;
  return mealPowers.map((mp, i) =>
    mp === power.mealPower ? target : currentVector[i] || 0,
  );
};

const getTargetTypeVectorForPosition = (
  targetType: TypeName,
  targetPlaceIndex: number,
  currentRankedTypes: TypeBoost[],
  currentVector: number[],
) => {
  const currentPlaceIndex = currentRankedTypes.findIndex(
    (t) => t.name === targetType,
  );

  // Target type is at desired rank
  if (currentPlaceIndex === targetPlaceIndex) {
    return currentVector;
  }

  const currentTargetPlaceAmount =
    currentRankedTypes[targetPlaceIndex]?.amount || 0;

  let typesAhead = currentRankedTypes
    .slice(0, targetPlaceIndex)
    .map((rt) => rt.name);

  if (typesAhead.length < targetPlaceIndex) {
    typesAhead = typesAhead
      .concat(allTypes)
      .filter((t) => t !== targetType)
      .slice(0, targetPlaceIndex);
  }

  // Target type is behind desired rank
  if (currentPlaceIndex < 0 || currentPlaceIndex > targetPlaceIndex) {
    return allTypes.map((t, i) => {
      if (typesAhead.includes(t)) {
        return Math.max(currentVector[i] || 0, currentTargetPlaceAmount + 2);
      }
      if (t === targetType) {
        return currentTargetPlaceAmount + 1;
      }
      return currentVector[i] || 0;
    });
  }

  // Target type is ahead of desired rank
  const currentTargetTypeAmount = currentRankedTypes[currentPlaceIndex].amount;

  let typesBehind = currentRankedTypes
    .slice(currentPlaceIndex + 1, targetPlaceIndex + 1)
    .map((rt) => rt.name);
  if (typesBehind.length < targetPlaceIndex - currentPlaceIndex) {
    typesBehind = typesBehind
      .concat(allTypes)
      .filter((t) => t !== targetType)
      .slice(0, targetPlaceIndex - currentPlaceIndex);
  }

  return allTypes.map((t, i) => {
    if (typesBehind.includes(t)) {
      return Math.max(currentTargetTypeAmount + 1, currentVector[i] || 0);
    }
    return currentVector[i] || 0;
  });
};

export interface GetTargetTypeVectorProps {
  targetPower: Power;
  targetConfig: TargetConfig;
  rankedTypeBoosts: TypeBoost[];
  typeVector: number[];
  forceDiff?: boolean;
}

export const getTargetTypeVector = ({
  targetPower: { type: targetType },
  targetConfig: { typePlaceIndex: targetPlaceIndex, config },
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

  let firstTargetIndex: number;
  let secondTargetIndex: number;
  if (targetPlaceIndex === 0) {
    firstTargetIndex = allTypes.indexOf(targetType);
    secondTargetIndex =
      currentRankedTypes[0]?.typeIndex ?? 1 - Math.min(firstTargetIndex, 1);
  } else if (targetPlaceIndex === 1) {
    secondTargetIndex = allTypes.indexOf(targetType);
    firstTargetIndex =
      currentRankedTypes[0]?.typeIndex ?? 1 - Math.min(secondTargetIndex, 1);
  } else {
    firstTargetIndex = currentRankedTypes[0]?.typeIndex ?? 0;
    secondTargetIndex =
      currentRankedTypes[1]?.typeIndex ?? 1 - Math.min(firstTargetIndex, 1);
  }

  const targetFirstAmount = tentativeTargetVector[firstTargetIndex];
  const targetSecondAmount = tentativeTargetVector[secondTargetIndex];
  let minFirstAmount = 0;
  let maxFirstAmount = Infinity;
  let maxSecondAmount = Infinity;
  if (config === 'ONE_ONE_ONE') {
    minFirstAmount = 481;
  } else if (config === 'ONE_ONE_THREE') {
    minFirstAmount = 106;
    maxSecondAmount = targetFirstAmount - 106;
    // also acceptable: minFirstAmount = 281;
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

export interface GetTargetLevelVectorProps {
  targetPower: Power;
  targetConfig: TargetConfig;
  typeVector: number[];
}

// TODO: revise
export const getTargetLevelVector = ({
  targetPower,
  targetConfig,
  typeVector: currentVector,
}: GetTargetLevelVectorProps) => {
  let minTarget = 1;
  if (targetPower.level === 2) minTarget = 180;
  if (targetPower.level === 3) minTarget = 380;

  if (mealPowerHasType(targetPower.mealPower)) {
    return allTypes.map((t, i) =>
      t === targetPower.type
        ? Math.max(currentVector[i] || 0, minTarget)
        : currentVector[i] || 0,
    );
  }

  const [maxComponent, maxComponentIndex] = allTypes.reduce(
    (accum, t, i) => {
      const comp = currentVector[i] || 0;
      const [max] = accum;
      if (comp > max) return [comp, i];
      if (comp === max && t === targetPower.type) return [comp, i];
      return accum;
    },
    [-Infinity, -1],
  );
  const target = Math.max(minTarget, maxComponent + 1);
  return allTypes.map((t, i) =>
    i === maxComponentIndex ? target : currentVector[i] || 0,
  );
};

export const boostMealPowerVector = (v: number[], boostedPower: MealPower) =>
  mealPowers.map((mp, i) => (mp === boostedPower ? (v[i] || 0) + 100 : v[i]));
