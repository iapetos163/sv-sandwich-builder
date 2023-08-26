import { mealPowerHasType } from '@/mechanics';
import { Power } from '@/types';

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

export const getPowerCopy = (power: Power) =>
  `Lv. ${power.level} ${mealPowerCopy[power.mealPower]} Power ${
    mealPowerHasType(power.mealPower) && `: ${allTypes[power.type]}`
  }`;
