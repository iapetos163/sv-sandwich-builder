export const diff = (a: number[], b: number[]) =>
  a.length >= b.length
    ? a.map((aVal, i) => aVal - (b[i] ?? 0))
    : b.map((bVal, i) => (a[i] ?? 0) - bVal);

export const innerProduct = (a: number[], b: number[]) =>
  a.reduce((product, aVal, i) => aVal * (b[i] ?? 0) + product, 0);

export const norm = (v: number[]) => Math.sqrt(innerProduct(v, v));
