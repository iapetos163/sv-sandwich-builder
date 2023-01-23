import { MealPower, TypeIndex } from '../../enum';
import { Power } from '../../types';

export interface TypeBoost {
  type: TypeIndex;
  amount: number;
}

export interface MealPowerBoost {
  mealPower: MealPower;
  amount: number;
}

export const mealPowerHasType = (mealPower: MealPower) =>
  mealPower !== MealPower.EGG;

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
    firstType = { type: 0, amount: 0 },
    secondType = { type: 1, amount: 0 },
    thirdType = { type: 2, amount: 0 },
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

const getUniqueMealPowers = (powers: Power[]) =>
  Object.keys(
    powers.reduce((agg, tp) => ({ [tp.mealPower]: true, ...agg }), {}),
  );

const getUniqueTypes = (powers: Power[]) =>
  Object.keys(powers.reduce((agg, tp) => ({ [tp.type]: true, ...agg }), {}));

export const getRepeatedType = (powers: Power[]): TypeIndex | null => {
  const typedPowers = powers.filter((p) => mealPowerHasType(p.mealPower));
  if (getUniqueTypes(typedPowers).length === typedPowers.length) {
    return null;
  }

  return typedPowers[0].type === typedPowers[1].type
    ? typedPowers[0].type
    : typedPowers[1].type;
};

export const requestedPowersValid = (powers: Power[]) => {
  if (getUniqueMealPowers(powers).length < powers.length) {
    return false;
  }

  const typedPowers = powers.filter((p) => mealPowerHasType(p.mealPower));
  const uniqueTypes = getUniqueTypes(typedPowers);
  const sparkling = powers.find((p) => p.mealPower === MealPower.SPARKLING);

  if (sparkling && uniqueTypes.length > 1) {
    return false;
  }

  if (!sparkling && uniqueTypes.length === 1 && typedPowers.length >= 3) {
    return false;
  }

  const title = powers.find((p) => p.mealPower === MealPower.TITLE);

  if (sparkling && !title && powers.length >= 3) {
    return false;
  }

  const lv3s = powers.filter((p) => p.level >= 3);
  if (!title && lv3s.length > 0 && powers.length >= 3) {
    return false;
  }

  const lv2Or3s = powers.filter((p) => p.level >= 2);
  if (!title && lv2Or3s.length > 2) {
    return false;
  }

  const hasSameTypes = uniqueTypes.length < typedPowers.length;
  if (!title && lv2Or3s.length >= 2 && hasSameTypes && powers.length >= 3) {
    return false;
  }

  return true;
};

export interface TargetConfig {
  config: TypeArrangement;
  typePlaceIndex: number;
  mpPlaceIndex: number;
}

export const configsEqual = (a: TargetConfig, b: TargetConfig) =>
  a.config === b.config &&
  a.typePlaceIndex === b.typePlaceIndex &&
  a.mpPlaceIndex === b.mpPlaceIndex;

export const getTargetConfigs = (
  targetPowers: Power[],
  targetNumHerba: number,
): TargetConfig[][] => {
  if (targetNumHerba >= 2) {
    return targetPowers.map((tp) => {
      if (tp.mealPower === MealPower.SPARKLING) {
        return [{ config: 'ONE_ONE_ONE', typePlaceIndex: 0, mpPlaceIndex: 0 }];
      }
      if (tp.mealPower === MealPower.TITLE) {
        return [{ config: 'ONE_ONE_ONE', typePlaceIndex: 0, mpPlaceIndex: 1 }];
      }
      return [{ config: 'ONE_ONE_ONE', typePlaceIndex: 0, mpPlaceIndex: 2 }];
    });
  }

  const repeatedType = getRepeatedType(targetPowers);
  const hasSameTypes = !!repeatedType;

  if (targetNumHerba >= 1 && hasSameTypes) {
    return targetPowers.map((tp): TargetConfig[] => {
      if (tp.mealPower === MealPower.TITLE) {
        return [
          { config: 'ONE_ONE_THREE', typePlaceIndex: 0, mpPlaceIndex: 1 },
        ];
      }
      if (tp.type === repeatedType) {
        return [
          { config: 'ONE_ONE_THREE', typePlaceIndex: 0, mpPlaceIndex: 2 },
        ];
      }
      return [{ config: 'ONE_ONE_THREE', typePlaceIndex: 2, mpPlaceIndex: 3 }];
    });
  }

  const titlePower = targetPowers.find(
    (tp) => tp.mealPower === MealPower.TITLE,
  );

  if (targetNumHerba >= 1 && titlePower) {
    return targetPowers.map((tp): TargetConfig[] => {
      if (tp.mealPower === MealPower.TITLE) {
        return [
          { config: 'ONE_ONE_THREE', typePlaceIndex: 0, mpPlaceIndex: 1 },
          { config: 'ONE_THREE_TWO', typePlaceIndex: 0, mpPlaceIndex: 1 },
        ];
      }
      return [
        { config: 'ONE_ONE_THREE', typePlaceIndex: 2, mpPlaceIndex: 3 },
        { config: 'ONE_THREE_TWO', typePlaceIndex: 1, mpPlaceIndex: 3 },
        { config: 'ONE_THREE_TWO', typePlaceIndex: 2, mpPlaceIndex: 2 },
      ];
    });
  }

  if (targetNumHerba >= 1) {
    return targetPowers.map((tp): TargetConfig[] => {
      if (tp.mealPower === MealPower.TITLE) {
        return [
          { config: 'ONE_ONE_THREE', typePlaceIndex: 0, mpPlaceIndex: 1 },
          { config: 'ONE_THREE_TWO', typePlaceIndex: 0, mpPlaceIndex: 1 },
        ];
      }
      return [
        { config: 'ONE_ONE_THREE', typePlaceIndex: 0, mpPlaceIndex: 2 },
        { config: 'ONE_ONE_THREE', typePlaceIndex: 2, mpPlaceIndex: 3 },
        { config: 'ONE_THREE_TWO', typePlaceIndex: 1, mpPlaceIndex: 3 },
        { config: 'ONE_THREE_TWO', typePlaceIndex: 2, mpPlaceIndex: 2 },
      ];
    });
  }

  // Level should not exceed 2 at this point
  const lv2s = targetPowers.filter((tp) => tp.level >= 2);

  // ONE_THREE_ONE can only be done if there are no level 2s
  if (hasSameTypes && lv2s.length === 1 && lv2s[0].type === repeatedType) {
    return targetPowers.map((tp): TargetConfig[] => {
      if (tp.level >= 2) {
        return [
          { config: 'ONE_ONE_THREE', typePlaceIndex: 0, mpPlaceIndex: 0 },
        ];
      }
      if (tp.type === repeatedType) {
        return [
          { config: 'ONE_ONE_THREE', typePlaceIndex: 0, mpPlaceIndex: 1 },
        ];
      }
      return [{ config: 'ONE_ONE_THREE', typePlaceIndex: 2, mpPlaceIndex: 2 }];
    });
  }

  // ONE_THREE_ONE can only be done if there are no level 2s
  // ONE_ONE_THREE can only be done with at most one level 2
  if (hasSameTypes && lv2s.length > 0) {
    return targetPowers.map((tp): TargetConfig[] => {
      if (tp.type === repeatedType) {
        return [
          { config: 'ONE_ONE_THREE', typePlaceIndex: 0, mpPlaceIndex: 0 },
          { config: 'ONE_ONE_THREE', typePlaceIndex: 0, mpPlaceIndex: 1 },
        ];
      }
      return [{ config: 'ONE_ONE_THREE', typePlaceIndex: 2, mpPlaceIndex: 2 }];
    });
  }

  if (hasSameTypes) {
    return targetPowers.map((tp): TargetConfig[] => {
      if (tp.type === repeatedType) {
        return [
          { config: 'ONE_THREE_ONE', typePlaceIndex: 0, mpPlaceIndex: 0 },
          { config: 'ONE_ONE_THREE', typePlaceIndex: 0, mpPlaceIndex: 0 },
          { config: 'ONE_THREE_ONE', typePlaceIndex: 0, mpPlaceIndex: 2 },
          { config: 'ONE_ONE_THREE', typePlaceIndex: 0, mpPlaceIndex: 1 },
        ];
      }
      return [
        { config: 'ONE_THREE_ONE', typePlaceIndex: 2, mpPlaceIndex: 1 },
        { config: 'ONE_ONE_THREE', typePlaceIndex: 2, mpPlaceIndex: 2 },
      ];
    });
  }

  if (targetPowers.length >= 3 && lv2s.length >= 2) {
    return targetPowers.map((tp): TargetConfig[] => {
      if (tp.level === 2) {
        return [
          { config: 'ONE_THREE_TWO', typePlaceIndex: 0, mpPlaceIndex: 0 },
          { config: 'ONE_THREE_TWO', typePlaceIndex: 2, mpPlaceIndex: 1 },
        ];
      }
      return [{ config: 'ONE_THREE_TWO', typePlaceIndex: 1, mpPlaceIndex: 2 }];
    });
  }

  if (targetPowers.length >= 3 && lv2s.length === 1) {
    return targetPowers.map((tp): TargetConfig[] => {
      if (tp.level >= 2) {
        return [
          { config: 'ONE_THREE_TWO', typePlaceIndex: 0, mpPlaceIndex: 0 },
        ];
      }
      return [
        { config: 'ONE_THREE_TWO', typePlaceIndex: 1, mpPlaceIndex: 2 },
        { config: 'ONE_THREE_TWO', typePlaceIndex: 2, mpPlaceIndex: 1 },
      ];
    });
  }

  if (targetPowers.length >= 3) {
    return targetPowers.map((): TargetConfig[] => [
      { config: 'ONE_THREE_TWO', typePlaceIndex: 0, mpPlaceIndex: 0 },
      { config: 'ONE_THREE_TWO', typePlaceIndex: 1, mpPlaceIndex: 2 },
      { config: 'ONE_THREE_TWO', typePlaceIndex: 2, mpPlaceIndex: 1 },
    ]);
  }

  // ONE_THREE_ONE can only be done if there are no level 2s
  // ONE_ONE_THREE can only be done with at most one level 2
  if (lv2s.length >= 2) {
    return targetPowers.map((tp): TargetConfig[] => {
      if (tp.level >= 2) {
        return [
          { config: 'ONE_THREE_TWO', typePlaceIndex: 0, mpPlaceIndex: 0 },
          { config: 'ONE_THREE_TWO', typePlaceIndex: 2, mpPlaceIndex: 1 },
        ];
      }
      return [{ config: 'ONE_THREE_TWO', typePlaceIndex: 1, mpPlaceIndex: 2 }];
    });
  }

  // ONE_THREE_ONE can only be done if there are no level 2s
  // ONE_ONE_THREE can only be done with at most one level 2
  if (lv2s.length === 1) {
    return targetPowers.map((tp): TargetConfig[] => {
      if (tp.level >= 2) {
        return [
          { config: 'ONE_THREE_TWO', typePlaceIndex: 0, mpPlaceIndex: 0 },
          { config: 'ONE_ONE_THREE', typePlaceIndex: 0, mpPlaceIndex: 0 },
        ];
      }
      return [
        { config: 'ONE_THREE_TWO', typePlaceIndex: 1, mpPlaceIndex: 2 },
        { config: 'ONE_THREE_TWO', typePlaceIndex: 2, mpPlaceIndex: 1 },

        { config: 'ONE_ONE_THREE', typePlaceIndex: 0, mpPlaceIndex: 1 },
        { config: 'ONE_ONE_THREE', typePlaceIndex: 2, mpPlaceIndex: 2 },
      ];
    });
  }

  return targetPowers.map((): TargetConfig[] => [
    { config: 'ONE_THREE_TWO', typePlaceIndex: 0, mpPlaceIndex: 0 },
    { config: 'ONE_THREE_TWO', typePlaceIndex: 1, mpPlaceIndex: 2 },
    { config: 'ONE_THREE_TWO', typePlaceIndex: 2, mpPlaceIndex: 1 },

    { config: 'ONE_THREE_ONE', typePlaceIndex: 0, mpPlaceIndex: 0 },
    { config: 'ONE_THREE_ONE', typePlaceIndex: 0, mpPlaceIndex: 2 },
    { config: 'ONE_THREE_ONE', typePlaceIndex: 2, mpPlaceIndex: 1 },
    { config: 'ONE_ONE_THREE', typePlaceIndex: 0, mpPlaceIndex: 0 },
    { config: 'ONE_ONE_THREE', typePlaceIndex: 0, mpPlaceIndex: 1 },
    { config: 'ONE_ONE_THREE', typePlaceIndex: 2, mpPlaceIndex: 2 },
  ]);
};

export const selectPowersAtTargetPositions = (
  powers: Power[],
  configSet: TargetConfig[],
): (Power | undefined)[] => {
  const leadingTitle = powers[0]?.mealPower === MealPower.TITLE;
  return configSet.map(
    (c) => powers[leadingTitle ? c.mpPlaceIndex - 1 : c.mpPlaceIndex],
  );
};

/**
 * @returns [index of first type, index of second type, index of third type]
 */
export const getTypeTargetIndices = (
  targetPowers: Power[],
  targetPlaceIndices: number[],
  rankedTypeBoosts: TypeBoost[],
): [TypeIndex, TypeIndex, TypeIndex] => {
  let firstTargetType: TypeIndex | null = null;
  let secondTargetType: TypeIndex | null = null;
  let thirdTargetType: TypeIndex | null = null;

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

  const typeSelection = rankedTypeBoosts.map((tb) => tb.type).concat([0, 1, 2]);

  if (!firstTargetType) {
    firstTargetType = typeSelection.find(
      (t) =>
        t !== firstTargetType &&
        t !== secondTargetType &&
        t !== thirdTargetType,
    )!;
  }
  if (!secondTargetType) {
    secondTargetType = typeSelection.find(
      (t) =>
        t !== firstTargetType &&
        t !== secondTargetType &&
        t !== thirdTargetType,
    )!;
  }
  if (!thirdTargetType) {
    thirdTargetType = typeSelection.find(
      (t) =>
        t !== thirdTargetType &&
        t !== secondTargetType &&
        t !== thirdTargetType,
    )!;
  }

  return [firstTargetType, secondTargetType, thirdTargetType];
};

export const rankMealPowerBoosts = (
  mealPowerVector: number[],
  boostedMealPower: MealPower | null,
): MealPowerBoost[] => {
  return mealPowerVector
    .map((c, i) => ({
      mealPower: i,
      amount: i === boostedMealPower ? c + 100 : c,
    }))
    .sort((a, b) => b.amount - a.amount || a.mealPower - b.mealPower);
};

export const rankTypeBoosts = (typeVector: number[]) =>
  typeVector
    .map(
      (c, i): TypeBoost => ({
        type: i,
        amount: c,
      }),
    )
    .sort((a, b) => b.amount - a.amount || a.type - b.type);

export const evaluateBoosts = (
  mealPowerVector: number[],
  boostedMealPower: MealPower | null,
  typeVector: number[],
) => {
  const rankedMealPowerBoosts = rankMealPowerBoosts(
    mealPowerVector,
    boostedMealPower,
  );
  const rankedTypeBoosts = rankTypeBoosts(typeVector);

  const assignedTypes = calculateTypes(rankedTypeBoosts);

  // according to sandwich simulator, this is pre-reordering types
  const assignedLevels = calculateLevels(rankedTypeBoosts);

  return rankedMealPowerBoosts
    .filter(
      (mpBoost) =>
        mpBoost.mealPower !== MealPower.SPARKLING || mpBoost.amount > 1000,
    )
    .slice(0, 3)
    .filter(
      (mpBoost, i) =>
        mpBoost.amount > 0 && assignedTypes[i] && assignedTypes[i].amount > 0,
    )
    .map(
      (mpBoost, i): Power => ({
        mealPower: mpBoost.mealPower,
        type: assignedTypes[i].type,
        level: assignedLevels[i],
      }),
    );
};

/**
 * Transforms an array of configs for each power
 * to an array config combinations
 */
export const permutePowerConfigs = (
  arr: TargetConfig[][],
): TargetConfig[][] => {
  const recurse = (
    powerSelections: TargetConfig[],
    remainingPowers: TargetConfig[][],
  ): TargetConfig[][] =>
    remainingPowers.length === 0
      ? [powerSelections]
      : remainingPowers[0]
          .filter(
            (c) =>
              (powerSelections.length === 0 ||
                c.config === powerSelections[0].config) &&
              !powerSelections.some((d) => configsEqual(c, d)),
          )
          .flatMap((c) =>
            recurse([...powerSelections, c], remainingPowers.slice(1)),
          );

  return recurse([], arr);
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
