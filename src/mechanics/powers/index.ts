import { allTypes, MealPower, mealPowers, TypeName } from '../../strings';
import { Boosts, Power } from '../../types';

export interface TypeBoost {
  name: TypeName;
  amount: number;
  typeIndex: number;
}

export const mealPowerHasType = (mealPower: MealPower) => mealPower !== 'Egg';

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
  rankedTypeBoosts: TypeBoost[],
): [number, number, number] => {
  const [
    { amount: firstTypeAmount } = { amount: 0 },
    { amount: secondTypeAmount } = { amount: 0 },
    { amount: thirdTypeAmount } = { amount: 0 },
  ] = rankedTypeBoosts;

  if (firstTypeAmount >= 460) {
    return [3, 3, 3];
  }

  if (firstTypeAmount >= 380) {
    if (thirdTypeAmount >= 380) {
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
    if (thirdTypeAmount >= 180) {
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

export const selectPowerAtTargetPosition = (
  powers: Power[],
  config: TargetConfig,
) => {
  const getIndex = () => {
    switch (config.config) {
      case 'ONE_ONE_ONE':
        return 0;
      case 'ONE_ONE_THREE':
        if (config.typePlaceIndex === 2) {
          return 2;
        }
        return 0;
      case 'ONE_THREE_ONE':
        if (config.typePlaceIndex === 2) {
          return 1;
        }
        return 0;
      case 'ONE_THREE_TWO':
        if (config.typePlaceIndex === 2) {
          return 1;
        }
        if (config.typePlaceIndex === 1) {
          return 2;
        }
        return 0;
    }
  };
  return powers[getIndex()];
};

/**
 * @returns [index of first type, index of second type, index of third type]
 */
export const getTypeTargetIndices = (
  targetType: TypeName,
  targetPlaceIndex: number,
  rankedTypeBoosts: TypeBoost[],
): [number, number, number] => {
  if (targetPlaceIndex === 0) {
    const firstTargetIndex = allTypes.indexOf(targetType);
    const secondTargetIndex =
      rankedTypeBoosts[0]?.typeIndex ??
      [0, 1].find((i) => i !== firstTargetIndex);
    const thirdTargetIndex =
      rankedTypeBoosts[1]?.typeIndex ??
      [0, 1, 2].find((i) => i !== firstTargetIndex && i !== secondTargetIndex);
    return [firstTargetIndex, secondTargetIndex, thirdTargetIndex];
  } else if (targetPlaceIndex === 1) {
    const secondTargetIndex = allTypes.indexOf(targetType);
    const firstTargetIndex =
      rankedTypeBoosts[0]?.typeIndex ??
      [0, 1].find((i) => i !== secondTargetIndex);
    const thirdTargetIndex =
      rankedTypeBoosts[1]?.typeIndex ??
      [0, 1, 2].find((i) => i !== firstTargetIndex && i !== secondTargetIndex);

    return [firstTargetIndex, secondTargetIndex, thirdTargetIndex];
  }
  const thirdTargetIndex = allTypes.indexOf(targetType);
  const firstTargetIndex =
    rankedTypeBoosts[0]?.typeIndex ??
    [0, 1].find((i) => i !== thirdTargetIndex);
  const secondTargetIndex =
    rankedTypeBoosts[1]?.typeIndex ??
    [0, 1, 2].find((i) => i !== firstTargetIndex && i !== thirdTargetIndex);
  return [firstTargetIndex, secondTargetIndex, thirdTargetIndex];
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
