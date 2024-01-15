import { mealPowerHasType } from '@/mechanics';
import type { Ingredient, ResultPower, TargetPower } from '@/types';
import type { Flavor, MealPower } from './enum';

export const allTypes = [
  'Normal',
  'Fighting',
  'Flying',
  'Poison',
  'Ground',
  'Rock',
  'Bug',
  'Ghost',
  'Steel',
  'Fire',
  'Water',
  'Grass',
  'Electric',
  'Psychic',
  'Ice',
  'Dragon',
  'Dark',
  'Fairy',
  'All',
];

export const mealPowerCopy = [
  'Egg',
  'Catching',
  'Exp. Point',
  'Item',
  'Raid',
  'Sparkling',
  'Title',
  'Humungo',
  'Teensy',
  'Encounter',
];

export const getPowerCopy = (power: ResultPower) =>
  `Lv. ${power.level} ${
    power.mealPower !== undefined ? mealPowerCopy[power.mealPower] : '???'
  } Power${
    power.mealPower === undefined || mealPowerHasType(power.mealPower)
      ? `: ${allTypes[power.type]}`
      : ''
  }`;

export const getSandwichKey = (
  fillings: Ingredient[],
  condiments: Ingredient[],
) =>
  fillings
    .map(({ id }) => id)
    .sort()
    .concat(condiments.map(({ id }) => id).sort())
    .join('_');
export const getFlavorKey = (
  flavors: [Flavor, Flavor],
  mealPowersByPlace: [MealPower, MealPower | null],
) => {
  const key = `${flavors[0]}_${flavors[1]}_${mealPowersByPlace[0]}`;
  return mealPowersByPlace[1] ? `${key}_${mealPowersByPlace[1]}` : key;
};
