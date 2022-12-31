export type Boosts<T extends string> = Partial<Record<T, number>>;

export const boostsEqual = <T extends string>(a: Boosts<T>, b: Boosts<T>) =>
  Object.entries(a).every(
    ([key, value]) => (!value && !b[key as T]) || value === b[key as T],
  ) &&
  Object.entries(b).every(
    ([key, value]) => (!value && !a[key as T]) || value === a[key as T],
  );
