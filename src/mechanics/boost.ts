import { Boosts } from '../types';

export const boostsEqual = <T extends string>(a: Boosts<T>, b: Boosts<T>) =>
  Object.entries(a).every(
    ([key, value]) => (!value && !b[key as T]) || value === b[key as T],
  ) &&
  Object.entries(b).every(
    ([key, value]) => (!value && !a[key as T]) || value === a[key as T],
  );

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
