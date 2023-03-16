export const add = (a: number[], b: number[]) =>
  a.length >= b.length
    ? a.map((aVal, i) => aVal + (b[i] ?? 0))
    : b.map((bVal, i) => (a[i] ?? 0) + bVal);

export const scale = (v: number[], n: number) => v.map((val) => val * n);

export const diff = (a: number[], b: number[]) =>
  a.length >= b.length
    ? a.map((aVal, i) => aVal - (b[i] ?? 0))
    : b.map((bVal, i) => (a[i] ?? 0) - bVal);

export const innerProduct = (a: number[], b: number[]) =>
  a.reduce((product, aVal, i) => aVal * (b[i] ?? 0) + product, 0);

export const norm = (v: number[]) => Math.sqrt(normSquared(v));

export const normSquared = (v: number[]) => innerProduct(v, v);

/**
 *
 * @param m Matrix (array of M rows, each row with N components)
 * @param v Vertical vector (N components)
 * @returns Vector with M components
 */
export const applyTransform = (m: number[][], v: number[]) =>
  m.map((u) => innerProduct(u, v));
