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

export const getTargetMealPowerVector = (
  power: Power,
  currentVector: number[],
) => {
  const target = Math.max(0, ...currentVector) + 1;
  return mealPowers.map((mp, i) =>
    mp === power.mealPower ? target : currentVector[i] || 0,
  );
};

export const getTargetTypeVector = (power: Power, currentVector: number[]) => {
  const target = Math.max(0, ...currentVector) + 1;
  return allTypes.map((t, i) =>
    t === power.type ? target : currentVector[i] || 0,
  );
};

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

// Assumes 3+ star sandwich
export const calculateTypes = (
  rankedTypes: TypeBoost[],
): [TypeBoost, TypeBoost, TypeBoost] => {
  const [
    firstType = { name: 'Normal', amount: 0 },
    secondType = { name: 'Normal', amount: 0 },
    thirdType = { name: 'Normal', amount: 0 },
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

export const rankMealPowerBoosts = (
  mealPowerBoosts: Partial<Record<MealPower, number>>,
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

const rankTypeBoosts = (typeBoosts: Partial<Record<TypeName, number>>) =>
  Object.entries(typeBoosts)
    .map(([t, v]) => ({ name: t as TypeName, amount: v }))
    .sort(
      (a, b) =>
        b.amount - a.amount ||
        allTypes.indexOf(a.name) - allTypes.indexOf(b.name),
    );

export const evaluateBoosts = (
  mealPowerBoosts: Partial<Record<MealPower, number>>,
  boostedMealPower: MealPower | null,
  typeBoosts: Partial<Record<TypeName, number>>,
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
