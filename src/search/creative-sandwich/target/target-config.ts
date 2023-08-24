import { MealPower, TypeIndex } from '../../../enum';
import {
  getRepeatedType,
  mealPowerHasType,
  TypeBoost,
} from '../../../mechanics';
import { Power } from '../../../types';

export type TypeAllocation =
  | 'ONE_ONE_ONE'
  | 'ONE_ONE_THREE'
  | 'ONE_THREE_ONE'
  | 'ONE_THREE_TWO';

export interface TargetConfig {
  /**
   * @deprecated
   * Use Target#typeAllocation instead
   */
  typeAllocation: TypeAllocation;
  typePlaceIndex: number;
  mpPlaceIndex: number;
  firstTypeGt?: number;
  firstTypeGte?: number;
  firstTypeLte?: number;
  thirdTypeGte?: number;
  /** firstType - secondType > 105 */
  diff105?: boolean;
  /** firstTypeAmount - 1.5 * secondTypeAmount >= 70 */
  diff70?: boolean;
}

export type InitTargetConfig = {
  typePlaceIndex: number;
  mpPlaceIndex: number;
};

export const configsEqual = (a: TargetConfig, b: TargetConfig) =>
  a.typeAllocation === b.typeAllocation &&
  a.typePlaceIndex === b.typePlaceIndex &&
  a.mpPlaceIndex === b.mpPlaceIndex;

export const getTargetConfigs = (
  targetPowers: Power[],
  targetNumHerba: number,
): TargetConfig[][] => {
  if (targetNumHerba >= 2) {
    const c = { typeAllocation: 'ONE_ONE_ONE' } as const;
    return targetPowers.map((tp) => {
      if (tp.mealPower === MealPower.SPARKLING) {
        return [{ ...c, typePlaceIndex: 0, mpPlaceIndex: 0 }];
      }
      if (tp.mealPower === MealPower.TITLE) {
        return [{ ...c, typePlaceIndex: 0, mpPlaceIndex: 1 }];
      }
      return [{ ...c, typePlaceIndex: 0, mpPlaceIndex: 2 }];
    });
  }

  const repeatedType = getRepeatedType(targetPowers);
  const hasSameTypes = !!repeatedType;

  if (targetNumHerba >= 1 && hasSameTypes) {
    const c = { typeAllocation: 'ONE_ONE_THREE', firstTypeGt: 280 } as const;
    return targetPowers.map((tp): TargetConfig[] => {
      if (tp.mealPower === MealPower.TITLE) {
        return [{ ...c, typePlaceIndex: 0, mpPlaceIndex: 1 }];
      }
      if (tp.type === repeatedType) {
        return [{ ...c, typePlaceIndex: 0, mpPlaceIndex: 2 }];
      }
      return [{ ...c, typePlaceIndex: 2, mpPlaceIndex: 3 }];
    });
  }

  const hasTitlePower = targetPowers.find(
    (tp) => tp.mealPower === MealPower.TITLE,
  );

  if (targetNumHerba >= 1 && hasTitlePower) {
    const oneOneThree = {
      typeAllocation: 'ONE_ONE_THREE',
      firstTypeGt: 280,
    } as const;
    const oneThreeTwo = {
      typeAllocation: 'ONE_THREE_TWO',
      firstTypeLte: 280,
    } as const;
    return targetPowers.map((tp): TargetConfig[] => {
      if (tp.mealPower === MealPower.TITLE) {
        return [
          { ...oneOneThree, typePlaceIndex: 0, mpPlaceIndex: 1 },
          { ...oneThreeTwo, typePlaceIndex: 0, mpPlaceIndex: 1 },
        ];
      }

      if (!mealPowerHasType(tp.mealPower)) {
        return [
          // We have already ruled out hasSameTypes
          // So this one isn't included if power has type
          { ...oneOneThree, typePlaceIndex: 0, mpPlaceIndex: 2 },
          { ...oneOneThree, typePlaceIndex: 2, mpPlaceIndex: 3 },
          { ...oneThreeTwo, typePlaceIndex: 1, mpPlaceIndex: 3 },
          { ...oneThreeTwo, typePlaceIndex: 2, mpPlaceIndex: 2 },
        ];
      }

      return [
        { ...oneOneThree, typePlaceIndex: 2, mpPlaceIndex: 3 },
        { ...oneThreeTwo, typePlaceIndex: 1, mpPlaceIndex: 3 },
        { ...oneThreeTwo, typePlaceIndex: 2, mpPlaceIndex: 2 },
      ];
    });
  }

  if (targetNumHerba >= 1) {
    const oneOneThree = {
      typeAllocation: 'ONE_ONE_THREE',
      firstTypeGt: 280,
    } as const;
    const oneThreeTwo = {
      typeAllocation: 'ONE_THREE_TWO',
      firstTypeLte: 280,
    } as const;
    // Does not have title as a target
    return targetPowers.map((): TargetConfig[] => {
      return [
        { ...oneOneThree, typePlaceIndex: 0, mpPlaceIndex: 2 },
        { ...oneOneThree, typePlaceIndex: 2, mpPlaceIndex: 3 },
        { ...oneThreeTwo, typePlaceIndex: 1, mpPlaceIndex: 3 },
        { ...oneThreeTwo, typePlaceIndex: 2, mpPlaceIndex: 2 },
      ];
    });
  }

  // Level should not exceed 2 at this point
  const lv2s = targetPowers.filter((tp) => tp.level >= 2);

  // ONE_THREE_ONE can only be done if there are no level 2s
  if (hasSameTypes && lv2s.length === 1 && lv2s[0].type === repeatedType) {
    const oneOneThree = {
      typeAllocation: 'ONE_ONE_THREE',
      firstTypeGte: 180,
      diff105: true,
    } as const;
    return targetPowers.map((tp): TargetConfig[] => {
      if (tp.level >= 2) {
        return [{ ...oneOneThree, typePlaceIndex: 0, mpPlaceIndex: 0 }];
      }
      if (tp.type === repeatedType) {
        return [{ ...oneOneThree, typePlaceIndex: 0, mpPlaceIndex: 1 }];
      }
      return [{ ...oneOneThree, typePlaceIndex: 2, mpPlaceIndex: 2 }];
    });
  }

  // ONE_THREE_ONE can only be done if there are no level 2s
  // ONE_ONE_THREE can only be done with at most one level 2
  if (hasSameTypes && lv2s.length > 0) {
    const oneOneThree = {
      typeAllocation: 'ONE_ONE_THREE',
      firstTypeGte: 180,
      diff105: true,
    } as const;
    return targetPowers.map((tp): TargetConfig[] => {
      if (tp.type === repeatedType) {
        return [
          { ...oneOneThree, typePlaceIndex: 0, mpPlaceIndex: 0 },
          { ...oneOneThree, typePlaceIndex: 0, mpPlaceIndex: 1 },
        ];
      }
      return [{ ...oneOneThree, typePlaceIndex: 2, mpPlaceIndex: 2 }];
    });
  }

  if (hasSameTypes) {
    return targetPowers.map((tp): TargetConfig[] => {
      const oneOneThree = {
        typeAllocation: 'ONE_ONE_THREE',
        firstTypeGt: 105,
        diff105: true,
      } as const;
      const oneThreeOne = {
        typeAllocation: 'ONE_THREE_ONE',
        firstTypeLte: 105,
        diff70: true,
      } as const;

      if (tp.type === repeatedType) {
        return [
          { ...oneThreeOne, typePlaceIndex: 0, mpPlaceIndex: 0 },
          { ...oneOneThree, typePlaceIndex: 0, mpPlaceIndex: 0 },
          { ...oneThreeOne, typePlaceIndex: 0, mpPlaceIndex: 2 },
          { ...oneOneThree, typePlaceIndex: 0, mpPlaceIndex: 1 },
        ];
      }
      return [
        { ...oneThreeOne, typePlaceIndex: 2, mpPlaceIndex: 1 },
        { ...oneOneThree, typePlaceIndex: 2, mpPlaceIndex: 2 },
      ];
    });
  }

  const couldHaveSameTypes = targetPowers.some(
    (p) => !mealPowerHasType(p.mealPower),
  );

  if (targetPowers.length >= 3 && !couldHaveSameTypes && lv2s.length >= 2) {
    const oneThreeTwo = {
      typeAllocation: 'ONE_THREE_TWO',
      thirdTypeGte: 180,
    } as const;

    return targetPowers.map((tp): TargetConfig[] => {
      if (tp.level === 2) {
        return [
          { ...oneThreeTwo, typePlaceIndex: 0, mpPlaceIndex: 0 },
          { ...oneThreeTwo, typePlaceIndex: 2, mpPlaceIndex: 1 },
        ];
      }
      return [{ ...oneThreeTwo, typePlaceIndex: 1, mpPlaceIndex: 2 }];
    });
  }

  if (targetPowers.length >= 3 && !couldHaveSameTypes && lv2s.length === 1) {
    const oneThreeTwo = {
      typeAllocation: 'ONE_THREE_TWO',
      firstTypeGte: 180,
    } as const;

    return targetPowers.map((tp): TargetConfig[] => {
      if (tp.level >= 2) {
        return [{ ...oneThreeTwo, typePlaceIndex: 0, mpPlaceIndex: 0 }];
      }
      return [
        { ...oneThreeTwo, typePlaceIndex: 1, mpPlaceIndex: 2 },
        { ...oneThreeTwo, typePlaceIndex: 2, mpPlaceIndex: 1 },
      ];
    });
  }

  if (targetPowers.length >= 3 && !couldHaveSameTypes) {
    return targetPowers.map((): TargetConfig[] => [
      { typeAllocation: 'ONE_THREE_TWO', typePlaceIndex: 0, mpPlaceIndex: 0 },
      { typeAllocation: 'ONE_THREE_TWO', typePlaceIndex: 1, mpPlaceIndex: 2 },
      { typeAllocation: 'ONE_THREE_TWO', typePlaceIndex: 2, mpPlaceIndex: 1 },
    ]);
  }

  // ONE_THREE_ONE can only be done if there are no level 2s
  // ONE_ONE_THREE can only be done with at most one level 2
  if (lv2s.length >= 2) {
    const c = { typeAllocation: 'ONE_THREE_TWO', thirdTypeGte: 180 } as const;
    return targetPowers.map((tp): TargetConfig[] => {
      if (tp.level >= 2) {
        return [
          { ...c, typePlaceIndex: 0, mpPlaceIndex: 0 },
          { ...c, typePlaceIndex: 2, mpPlaceIndex: 1 },
        ];
      }
      return [{ ...c, typePlaceIndex: 1, mpPlaceIndex: 2 }];
    });
  }

  // ONE_THREE_ONE can only be done if there are no level 2s
  // ONE_ONE_THREE can only be done with at most one level 2
  if (lv2s.length === 1) {
    const oneThreeTwo = {
      typeAllocation: 'ONE_THREE_TWO',
      diff105: false,
      firstTypeGte: 180,
    } as const;
    const oneOneThree = {
      typeAllocation: 'ONE_ONE_THREE',
      diff105: true,
    } as const;
    return targetPowers.map((tp): TargetConfig[] => {
      if (tp.level >= 2) {
        return [
          { ...oneThreeTwo, typePlaceIndex: 0, mpPlaceIndex: 0 },
          { ...oneOneThree, typePlaceIndex: 0, mpPlaceIndex: 0 },
        ];
      }
      return [
        { ...oneThreeTwo, typePlaceIndex: 1, mpPlaceIndex: 2 },
        { ...oneThreeTwo, typePlaceIndex: 2, mpPlaceIndex: 1 },

        { ...oneOneThree, typePlaceIndex: 0, mpPlaceIndex: 1 },
        { ...oneOneThree, typePlaceIndex: 2, mpPlaceIndex: 2 },
      ];
    });
  }

  const oneThreeTwo = {
    typeAllocation: 'ONE_THREE_TWO',
    diff105: false,
  } as const;
  const oneOneThree = {
    typeAllocation: 'ONE_ONE_THREE',
    diff105: true,
  } as const;
  const oneThreeOne = {
    typeAllocation: 'ONE_THREE_ONE',
    firstTypeLte: 105,
    diff70: true,
  } as const;
  return targetPowers.map((): TargetConfig[] => [
    { ...oneThreeTwo, typePlaceIndex: 0, mpPlaceIndex: 0 },
    { ...oneThreeTwo, typePlaceIndex: 1, mpPlaceIndex: 2 },
    { ...oneThreeTwo, typePlaceIndex: 2, mpPlaceIndex: 1 },

    { ...oneThreeOne, typePlaceIndex: 0, mpPlaceIndex: 0 },
    { ...oneThreeOne, typePlaceIndex: 0, mpPlaceIndex: 2 },
    { ...oneThreeOne, typePlaceIndex: 2, mpPlaceIndex: 1 },
    { ...oneOneThree, typePlaceIndex: 0, mpPlaceIndex: 0 },
    { ...oneOneThree, typePlaceIndex: 0, mpPlaceIndex: 1 },
    { ...oneOneThree, typePlaceIndex: 2, mpPlaceIndex: 2 },
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

/**
 * Transforms an array of configs for each power
 * to an array config combinations
 */
export const permutePowerConfigs = (
  powers: Power[],
  configs: TargetConfig[][],
): TargetConfig[][] => {
  type RecurseArgs = {
    powerSelections: TargetConfig[];
    powerIndex: number;
    typePlaceIndexMapping: Partial<Record<TypeIndex, number>>;
    firstTypeGte: number;
    firstTypeLte: number;
    thirdTypeGte: number;
  };

  const recurse = ({
    powerSelections,
    powerIndex,
    typePlaceIndexMapping,
    firstTypeLte,
    firstTypeGte,
    thirdTypeGte,
  }: RecurseArgs): TargetConfig[][] => {
    if (powers.length <= powerIndex) return [powerSelections];

    if (!mealPowerHasType(powers[powerIndex].mealPower)) {
      return configs[powerIndex]
        .filter(
          (c) =>
            (powerSelections.length === 0 ||
              c.typeAllocation === powerSelections[0].typeAllocation) &&
            !powerSelections.some((d) => configsEqual(c, d)) &&
            (c.firstTypeGt || 0) < firstTypeLte &&
            (c.firstTypeGte || 0) <= firstTypeLte &&
            (c.firstTypeLte === undefined || c.firstTypeLte >= firstTypeGte) &&
            (c.thirdTypeGte || 0 <= firstTypeLte),
        )
        .flatMap((c) =>
          recurse({
            powerSelections: [...powerSelections, c],
            powerIndex: powerIndex + 1,
            typePlaceIndexMapping,
            firstTypeGte: Math.max(
              firstTypeGte,
              (c.firstTypeGt || -1) + 1,
              c.firstTypeGte || 0,
              c.thirdTypeGte || 0,
            ),
            firstTypeLte: Math.min(firstTypeLte, c.firstTypeLte ?? Infinity),
            thirdTypeGte: Math.max(thirdTypeGte, c.thirdTypeGte || 0),
          }),
        );
    }

    const powerType = powers[powerIndex].type;
    const assignedTypePlaceIndex = typePlaceIndexMapping[powerType];

    if (assignedTypePlaceIndex !== undefined) {
      return configs[powerIndex]
        .filter(
          (c) =>
            (powerSelections.length === 0 ||
              c.typeAllocation === powerSelections[0].typeAllocation) &&
            c.typePlaceIndex === assignedTypePlaceIndex &&
            !powerSelections.some((d) => configsEqual(c, d)) &&
            (c.firstTypeGt || 0) < firstTypeLte &&
            (c.firstTypeGte || 0) <= firstTypeLte &&
            (c.firstTypeLte === undefined || c.firstTypeLte >= firstTypeGte) &&
            (c.thirdTypeGte || 0 <= firstTypeLte),
        )
        .flatMap((c) =>
          recurse({
            powerSelections: [...powerSelections, c],
            powerIndex: powerIndex + 1,
            typePlaceIndexMapping,
            firstTypeGte: Math.max(
              firstTypeGte,
              (c.firstTypeGt || -1) + 1,
              c.firstTypeGte || 0,
              c.thirdTypeGte || 0,
            ),
            firstTypeLte: Math.min(firstTypeLte, c.firstTypeLte ?? Infinity),
            thirdTypeGte: Math.max(thirdTypeGte, c.thirdTypeGte || 0),
          }),
        );
    }
    return configs[powerIndex]
      .filter(
        (c) =>
          (powerSelections.length === 0 ||
            c.typeAllocation === powerSelections[0].typeAllocation) &&
          !Object.values(typePlaceIndexMapping).some(
            (pi) => c.typePlaceIndex === pi,
          ) &&
          !powerSelections.some((d) => configsEqual(c, d)) &&
          (c.firstTypeGt || 0) < firstTypeLte &&
          (c.firstTypeGte || 0) <= firstTypeLte &&
          (c.firstTypeLte === undefined || c.firstTypeLte >= firstTypeGte) &&
          (c.thirdTypeGte || 0 <= firstTypeLte),
      )
      .flatMap((c) =>
        recurse({
          powerSelections: [...powerSelections, c],
          powerIndex: powerIndex + 1,
          typePlaceIndexMapping: {
            ...typePlaceIndexMapping,
            [powerType]: c.typePlaceIndex,
          },
          firstTypeGte: Math.max(
            firstTypeGte,
            (c.firstTypeGt || -1) + 1,
            c.firstTypeGte || 0,
            c.thirdTypeGte || 0,
          ),
          firstTypeLte: Math.min(firstTypeLte, c.firstTypeLte ?? Infinity),
          thirdTypeGte: Math.max(thirdTypeGte, c.thirdTypeGte || 0),
        }),
      );
  };

  return recurse({
    powerSelections: [],
    powerIndex: 0,
    typePlaceIndexMapping: {},
    firstTypeGte: 0,
    firstTypeLte: Infinity,
    thirdTypeGte: 0,
  });
};

export const allocationHasMaxes = (typeAllocation: TypeAllocation) =>
  typeAllocation === 'ONE_ONE_THREE' || typeAllocation === 'ONE_THREE_ONE';
