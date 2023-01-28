import { MealPower, TypeIndex } from '../../enum';
import { getRepeatedType, mealPowerHasType, TypeBoost } from '../../mechanics';
import { Power } from '../../types';

export type TypeArrangement =
  | 'ONE_ONE_ONE'
  | 'ONE_ONE_THREE'
  | 'ONE_THREE_ONE'
  | 'ONE_THREE_TWO';

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
export const getTypeTargetsByPlace = (
  targetPowers: Power[],
  targetPlaceIndices: number[],
  rankedTypeBoosts: TypeBoost[],
): [TypeIndex, TypeIndex, TypeIndex] => {
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

  const typeSelection = rankedTypeBoosts.map((tb) => tb.type).concat([0, 1, 2]);

  if (firstTargetType === null) {
    firstTargetType = typeSelection.find(
      (t) =>
        t !== firstTargetType &&
        t !== secondTargetType &&
        t !== thirdTargetType,
    )!;
  }
  if (secondTargetType === null) {
    secondTargetType = typeSelection.find(
      (t) =>
        t !== firstTargetType &&
        t !== secondTargetType &&
        t !== thirdTargetType,
    )!;
  }
  if (thirdTargetType === null) {
    thirdTargetType = typeSelection.find(
      (t) =>
        t !== firstTargetType &&
        t !== secondTargetType &&
        t !== thirdTargetType,
    )!;
  }

  return [firstTargetType, secondTargetType, thirdTargetType];
};

/**
 * Transforms an array of configs for each power
 * to an array config combinations
 */
export const permutePowerConfigs = (
  powers: Power[],
  configs: TargetConfig[][],
): TargetConfig[][] => {
  const recurse = (
    powerSelections: TargetConfig[],
    powerIndex: number,
    typePlaceIndexMapping: Partial<Record<TypeIndex, number>>,
  ): TargetConfig[][] => {
    if (powers.length === powerIndex) return [powerSelections];
    const powerType = powers[powerIndex].type;
    const assignedTypePlaceIndex = typePlaceIndexMapping[powerType];

    if (assignedTypePlaceIndex !== undefined) {
      return configs[powerIndex]
        .filter(
          (c) =>
            (powerSelections.length === 0 ||
              c.config === powerSelections[0].config) &&
            c.typePlaceIndex === assignedTypePlaceIndex &&
            !powerSelections.some((d) => configsEqual(c, d)),
        )
        .flatMap((c) =>
          recurse(
            [...powerSelections, c],
            powerIndex + 1,
            typePlaceIndexMapping,
          ),
        );
    }
    return configs[powerIndex]
      .filter(
        (c) =>
          (powerSelections.length === 0 ||
            c.config === powerSelections[0].config) &&
          !Object.values(typePlaceIndexMapping).some(
            (pi) => c.typePlaceIndex === pi,
          ) &&
          !powerSelections.some((d) => configsEqual(c, d)),
      )
      .flatMap((c) =>
        recurse([...powerSelections, c], powerIndex + 1, {
          ...typePlaceIndexMapping,
          [powerType]: c.typePlaceIndex,
        }),
      );
  };

  return recurse([], 0, {});
};
