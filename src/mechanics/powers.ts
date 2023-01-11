import { allTypes, MealPower, mealPowers, TypeName } from '../strings';
import { Boosts, Power } from '../types';

export interface TypeBoost {
  name: TypeName;
  amount: number;
  typeIndex: number;
}

export const mealPowerHasType = (mealPower: MealPower) => mealPower !== 'Egg';

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

export const getTargetTypeVector = (
  { type: targetType }: Power,
  { typePlaceIndex: targetPlaceIndex, config }: TargetConfig,
  currentRankedTypes: TypeBoost[],
  currentVector: number[],
) => {
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
  return tentativeTargetVector.map((c, i) =>
    i === firstTargetIndex ? Math.max(c, minFirstAmount) : c,
  );
};

// TODO: revise
export const getTargetLevelVector = (power: Power, currentVector: number[]) => {
  let minTarget = 1;
  if (power.level === 2) minTarget = 180;
  if (power.level === 3) minTarget = 380;

  if (mealPowerHasType(power.mealPower)) {
    return allTypes.map((t, i) =>
      t === power.type
        ? Math.max(currentVector[i] || 0, minTarget)
        : currentVector[i] || 0,
    );
  }

  const [maxComponent, maxComponentIndex] = allTypes.reduce(
    (accum, t, i) => {
      const comp = currentVector[i] || 0;
      const [max] = accum;
      if (comp > max) return [comp, i];
      if (comp === max && t === power.type) return [comp, i];
      return accum;
    },
    [-Infinity, -1],
  );
  const target = Math.max(minTarget, maxComponent + 1);
  return allTypes.map((t, i) =>
    i === maxComponentIndex ? target : currentVector[i] || 0,
  );
};

export const simplifyTypeVector = (v: number[]) => {
  const minValue = Math.min(...v);
  if (minValue > 0) {
    return v.map((val) => val - minValue);
  }
  const maxValue = Math.max(...v);
  if (maxValue < 0) {
    return v.map((val) => val - maxValue);
  }
  return v;
};

export const boostMealPowerVector = (v: number[], boostedPower: MealPower) =>
  mealPowers.map((mp, i) => (mp === boostedPower ? (v[i] || 0) + 100 : v[i]));

export type TypeArrangement =
  | 'ONE_ONE_ONE'
  | 'ONE_ONE_THREE'
  | 'ONE_THREE_ONE'
  | 'ONE_THREE_TWO';

// Assumes 3+ star sandwich
export const calculateTypes = (
  rankedTypes: TypeBoost[],
): [TypeBoost, TypeBoost, TypeBoost] => {
  const [
    firstType = { name: allTypes[0], typeIndex: 0, amount: 0 },
    secondType = { name: allTypes[1], typeIndex: 1, amount: 0 },
    thirdType = { name: allTypes[2], typeIndex: 2, amount: 0 },
  ] = rankedTypes;
  const { amount: mainTypeAmount } = firstType;
  const { amount: secondTypeAmount } = secondType;
  const oneTwoDiff = mainTypeAmount - secondTypeAmount;

  if (mainTypeAmount > 480) {
    // mono type
    return [firstType, firstType, firstType];
  }
  if (mainTypeAmount > 280 || (mainTypeAmount > 105 && oneTwoDiff > 105)) {
    // dual type
    return [firstType, firstType, thirdType];
  }

  if (mainTypeAmount <= 105) {
    if (mainTypeAmount >= 100) {
      if (oneTwoDiff >= 80 && secondTypeAmount <= 21) {
        return [firstType, thirdType, firstType];
      }
    } else if (mainTypeAmount >= 90) {
      if (oneTwoDiff >= 78 && secondTypeAmount <= 16) {
        return [firstType, thirdType, firstType];
      }
    } else if (mainTypeAmount >= 80) {
      if (oneTwoDiff >= 74 && secondTypeAmount <= 9) {
        return [firstType, thirdType, firstType];
      }
    } else if (mainTypeAmount >= 74) {
      if (oneTwoDiff >= 72 && secondTypeAmount <= 5) {
        return [firstType, thirdType, firstType];
      }
    }
  }

  return [firstType, thirdType, secondType];
};

// returns array of levels
export const calculateLevels = (
  types: TypeBoost[],
): [number, number, number] => {
  const [
    { amount: firstTypeAmount } = { amount: 0 },
    { amount: secondTypeAmount } = { amount: 0 },
    { amount: thirdTypeAmount } = { amount: 0 },
  ] = types;

  if (firstTypeAmount >= 460) {
    return [3, 3, 3];
  }

  if (firstTypeAmount >= 380) {
    if (secondTypeAmount >= 380 && thirdTypeAmount >= 380) {
      return [3, 3, 3];
    }
    return [3, 3, 2];
  }

  if (firstTypeAmount > 280) {
    if (thirdTypeAmount >= 180) {
      return [2, 2, 2];
    }
    return [2, 2, 1];
  }

  if (firstTypeAmount >= 180) {
    if (secondTypeAmount >= 180 && thirdTypeAmount >= 180) {
      return [2, 2, 1];
    }
    return [2, 1, 1];
  }

  return [1, 1, 1];
};

export interface TargetConfig {
  config: TypeArrangement;
  typePlaceIndex: number;
  mpPlaceIndex: number;
}

export const getTargetConfigs = (
  targetPower: Power,
  targetNumHerba: number,
): TargetConfig[] => {
  if (targetNumHerba >= 2 && targetPower.mealPower === 'Sparkling') {
    return [{ config: 'ONE_ONE_ONE', typePlaceIndex: 0, mpPlaceIndex: 0 }];
  }
  if (targetNumHerba >= 2 && targetPower.mealPower === 'Title') {
    return [{ config: 'ONE_ONE_ONE', typePlaceIndex: 0, mpPlaceIndex: 1 }];
  }
  if (targetNumHerba >= 2) {
    return [{ config: 'ONE_ONE_ONE', typePlaceIndex: 0, mpPlaceIndex: 0 }];
  }
  if (targetNumHerba >= 1 && targetPower.mealPower === 'Title') {
    return [
      { config: 'ONE_ONE_THREE', typePlaceIndex: 0, mpPlaceIndex: 0 },
      { config: 'ONE_THREE_TWO', typePlaceIndex: 0, mpPlaceIndex: 0 },
    ];
  }
  if (targetNumHerba >= 1 && targetPower.level === 3) {
    return [{ config: 'ONE_ONE_THREE', typePlaceIndex: 0, mpPlaceIndex: 2 }];
  }
  if (targetNumHerba >= 1) {
    return [
      { config: 'ONE_ONE_THREE', typePlaceIndex: 0, mpPlaceIndex: 2 },
      { config: 'ONE_THREE_TWO', typePlaceIndex: 2, mpPlaceIndex: 2 },
    ];
  }
  return [
    { config: 'ONE_THREE_ONE', typePlaceIndex: 0, mpPlaceIndex: 0 },
    { config: 'ONE_ONE_THREE', typePlaceIndex: 0, mpPlaceIndex: 0 },
    { config: 'ONE_THREE_TWO', typePlaceIndex: 0, mpPlaceIndex: 0 },
  ];
};

export const rankMealPowerBoosts = (
  mealPowerBoosts: Boosts<MealPower>,
  boostedMealPower: MealPower | null,
) => {
  const boosts = boostedMealPower
    ? {
        ...mealPowerBoosts,
        [boostedMealPower]: mealPowerBoosts[boostedMealPower] || 0,
      }
    : mealPowerBoosts;
  return Object.entries(boosts)
    .map(([mp, v]) => ({
      name: mp as MealPower,
      amount: mp === boostedMealPower ? v + 100 : v,
    }))
    .sort(
      (a, b) =>
        b.amount - a.amount ||
        mealPowers.indexOf(a.name) - mealPowers.indexOf(b.name),
    );
};

export const rankTypeBoosts = (typeBoosts: Boosts<TypeName>) =>
  Object.entries(typeBoosts)
    .map(
      ([t, v]): TypeBoost => ({
        name: t as TypeName,
        amount: v,
        typeIndex: allTypes.indexOf(t as TypeName),
      }),
    )
    .sort((a, b) => b.amount - a.amount || a.typeIndex - b.typeIndex);

export const evaluateBoosts = (
  mealPowerBoosts: Boosts<MealPower>,
  boostedMealPower: MealPower | null,
  typeBoosts: Boosts<TypeName>,
) => {
  const rankedMealPowerBoosts = rankMealPowerBoosts(
    mealPowerBoosts,
    boostedMealPower,
  );
  const rankedTypeBoosts = rankTypeBoosts(typeBoosts);

  const assignedTypes = calculateTypes(rankedTypeBoosts);

  // according to sandwich simulator, this is pre-reordering types
  const assignedLevels = calculateLevels(rankedTypeBoosts);

  return rankedMealPowerBoosts
    .filter((mpBoost) => mpBoost.name !== 'Sparkling' || mpBoost.amount > 1000)
    .slice(0, 3)
    .filter(
      (mpBoost, i) =>
        mpBoost.amount > 0 && assignedTypes[i] && assignedTypes[i].amount > 0,
    )
    .map(
      (mpBoost, i): Power => ({
        mealPower: mpBoost.name,
        type: assignedTypes[i].name,
        level: assignedLevels[i],
      }),
    );
};

export const powersMatch = (test: Power, target: Power) =>
  test.level >= target.level &&
  test.mealPower === target.mealPower &&
  (!mealPowerHasType(test.mealPower) || test.type === target.type);

export const powersEqual = (a: Power, b: Power) =>
  a.level === b.level &&
  a.mealPower === b.mealPower &&
  (!mealPowerHasType(a.mealPower) || a.type === b.type);

export const powerToString = (p: Power) => {
  if (!mealPowerHasType(p.mealPower)) {
    return `Lv. ${p.level} ${p.mealPower}`;
  }
  return `Lv. ${p.level} ${p.mealPower} ${p.type}`;
};
