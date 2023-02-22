import { rangeMealPowers, rangeTypes } from './enum';

type VectorSet = {
  mealPowerVector: number[];
  typeVector: number[];
  flavorVector: number[];
};

export const createMetaVector = ({
  mealPowerVector,
  typeVector,
  flavorVector,
}: VectorSet): number[] =>
  rangeMealPowers
    .map((i) => mealPowerVector[i] ?? 0)
    .concat(rangeTypes.map((i) => typeVector[i] ?? 0))
    .concat(flavorVector);

// TODO test
export const deconstructMetaVector = (metaVector: number[]): VectorSet => ({
  mealPowerVector: metaVector.slice(0, rangeMealPowers.length),
  typeVector: metaVector.slice(
    rangeMealPowers.length,
    rangeMealPowers.length + rangeTypes.length,
  ),
  flavorVector: metaVector.slice(
    rangeMealPowers.length + rangeTypes.length,
    metaVector.length,
  ),
});
