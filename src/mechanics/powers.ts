import { MealPower, TypeIndex } from '@/enum';
import { TargetPower } from '@/types';

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

export const isHerbaMealPower = (mealPower: MealPower) =>
  mealPower === MealPower.SPARKLING || mealPower === MealPower.TITLE;

// Assumes 3+ star sandwich
export const calculateTypes = (
  rankedTypes: TypeBoost[],
): [TypeBoost, TypeBoost, TypeBoost] => {
  const [
    firstType = { type: 0, amount: 0 },
    secondType = { type: 1, amount: 0 },
    thirdType = { type: 2, amount: 0 },
  ] = rankedTypes;
  const { amount: firstTypeAmount } = firstType;
  const { amount: secondTypeAmount } = secondType;

  if (firstTypeAmount > 480) {
    // mono type
    return [firstType, firstType, firstType];
  }
  if (
    firstTypeAmount > 280 ||
    (firstTypeAmount > 105 && firstTypeAmount - secondTypeAmount > 105)
  ) {
    // dual type
    return [firstType, firstType, thirdType];
  }

  if (
    firstTypeAmount <= 105 &&
    firstTypeAmount - 1.5 * secondTypeAmount >= 70
  ) {
    return [firstType, thirdType, firstType];
    // if (firstTypeAmount >= 100) {
    //   if (oneTwoDiff >= 80 && secondTypeAmount <= 21) {
    //     return [firstType, thirdType, firstType];
    //   }
    // } else if (firstTypeAmount >= 90) {
    //   if (oneTwoDiff >= 78 && secondTypeAmount <= 16) {
    //     return [firstType, thirdType, firstType];
    //   }
    // } else if (firstTypeAmount >= 80) {
    //   if (oneTwoDiff >= 74 && secondTypeAmount <= 9) {
    //     return [firstType, thirdType, firstType];
    //   }
    // } else if (firstTypeAmount >= 74) {
    //   if (oneTwoDiff >= 72 && secondTypeAmount <= 5) {
    //     return [firstType, thirdType, firstType];
    //   }
    // }
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
    // FIXME ?
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

const getUniqueMealPowers = (powers: TargetPower[]) =>
  Object.keys(
    powers.reduce((agg, tp) => ({ [tp.mealPower]: true, ...agg }), {}),
  );

const getUniqueTypes = (powers: TargetPower[]) =>
  Object.keys(powers.reduce((agg, tp) => ({ [tp.type]: true, ...agg }), {}));

export const getRepeatedType = (powers: TargetPower[]): TypeIndex | null => {
  const typedPowers = powers.filter((p) => mealPowerHasType(p.mealPower));
  if (getUniqueTypes(typedPowers).length === typedPowers.length) {
    return null;
  }

  return typedPowers[0].type === typedPowers[1].type
    ? typedPowers[0].type
    : typedPowers[1].type;
};

export const requestedPowersValid = (powers: TargetPower[]) => {
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

export const rankMealPowerBoosts = (
  mealPowerVector: number[],
  boostedMealPower?: MealPower | null,
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
        mpBoost.amount > 0 && assignedTypes[i] && assignedTypes[i].amount >= 0,
    )
    .map(
      (mpBoost, i): TargetPower => ({
        mealPower: mpBoost.mealPower,
        type: assignedTypes[i].type,
        level: assignedLevels[i],
      }),
    );
};

export const powersMatch = (test: TargetPower, target: TargetPower) =>
  test.level >= target.level &&
  test.mealPower === target.mealPower &&
  (!mealPowerHasType(test.mealPower) || test.type === target.type);

export const powersEqual = (a: TargetPower, b: TargetPower) =>
  a.level === b.level &&
  a.mealPower === b.mealPower &&
  (!mealPowerHasType(a.mealPower) || a.type === b.type);

export const powerSetsMatch = (test: TargetPower[], target: TargetPower[]) =>
  target.every((tp) => test.some((p) => powersMatch(p, tp)));

export const powerToString = (p: TargetPower) => {
  if (!mealPowerHasType(p.mealPower)) {
    return `Lv. ${p.level} ${p.mealPower}`;
  }
  return `Lv. ${p.level} ${p.mealPower} ${p.type}`;
};
