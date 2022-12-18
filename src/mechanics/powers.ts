import { allTypes, MealPower, mealPowers, TypeName } from '../strings';

export interface Power {
  mealPower: MealPower;
  type: TypeName;
  level: number;
}
interface TypeBoost {
  name: TypeName;
  amount: number;
}

export const mealPowerHasType = (mealPower: MealPower) => mealPower !== 'Egg';

export const getMealPowerVector = (power: Power, matchNorm: number) =>
  mealPowers.map((mp) => (mp === power.mealPower ? matchNorm : 0));

export const getTypeVector = (
  { mealPower, level }: Power,
  matchNorm: number,
) => {
  let minNorm = 1;
  if (level === 2) minNorm = 180;
  if (level === 3) minNorm = 380;
  const norm = Math.max(minNorm, matchNorm);
  return mealPowers.map((t) => (t === mealPower ? norm : 0));
};

export const boostMealPowerVector = (v: number[], boostedPower: MealPower) =>
  mealPowers.map((mp, i) => (mp === boostedPower ? (v[i] || 0) + 100 : v[i]));

// Assumes 3+ star sandwich
const calculateTypes = (
  rankedTypes: TypeBoost[],
): [TypeBoost, TypeBoost, TypeBoost] => {
  const [firstType, secondType, thirdType] = rankedTypes;
  const { amount: mainTypeAmount } = firstType || { amount: 0 };
  const { amount: secondTypeAmount } = secondType || { amount: 0 };
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
const calculateLevels = (types: TypeBoost[]): [number, number, number] => {
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

export const addBoosts = <T extends string>(
  baseBoosts: Partial<Record<T, number>>,
  newBoosts: Partial<Record<T, number>>,
) => {
  const result = { ...baseBoosts };
  for (const key of Object.keys(newBoosts) as T[]) {
    result[key] = (result[key] || 0) + newBoosts[key]!;
  }
  return result;
};

export const evaluateBoosts = (
  mealPowerBoosts: Partial<Record<MealPower, number>>,
  boostedMealPower: MealPower | null,
  typeBoosts: Partial<Record<TypeName, number>>,
) => {
  const rankedMealPowerBoosts = Object.entries(mealPowerBoosts)
    .map(([t, v]) => ({
      name: t as MealPower,
      amount: t === boostedMealPower ? v + 100 : v,
    }))
    .sort(
      (a, b) =>
        b.amount - a.amount ||
        mealPowers.indexOf(a.name) - mealPowers.indexOf(b.name),
    );

  const rankedTypeBoosts = Object.entries(typeBoosts)
    .map(([t, v]) => ({ name: t as TypeName, amount: v }))
    .sort(
      (a, b) =>
        b.amount - a.amount ||
        allTypes.indexOf(a.name) - allTypes.indexOf(b.name),
    );

  const assignedTypes = calculateTypes(rankedTypeBoosts);

  // according to sandwich simulator, this is pre-reordering types
  const assignedLevels = calculateLevels(rankedTypeBoosts);

  return rankedMealPowerBoosts
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

export const powersMatch = (a: Power, b: Power) =>
  a.level === b.level && a.mealPower === b.mealPower && a.type === b.type;
