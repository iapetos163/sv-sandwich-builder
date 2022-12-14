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

export const mealPowers = [
  'Egg',
  'Catching',
  'Encounter',
  'Exp.',
  'Item Drop',
  'Raid',
  'Humungo',
  'Teensy',
  'Title',
  'Sparkling',
];

export const mealPowerHasType = (mealPower: string) => mealPower !== 'Egg';

export interface Power {
  mealPower: string;
  type: string;
}
