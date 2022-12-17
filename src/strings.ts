export type TypeName =
  | 'Normal'
  | 'Fighting'
  | 'Flying'
  | 'Poison'
  | 'Ground'
  | 'Rock'
  | 'Bug'
  | 'Ghost'
  | 'Steel'
  | 'Fire'
  | 'Water'
  | 'Grass'
  | 'Electric'
  | 'Psychic'
  | 'Ice'
  | 'Dragon'
  | 'Dark'
  | 'Fairy';

export type MealPower =
  | 'Egg'
  | 'Catch'
  | 'Item'
  | 'Humungo'
  | 'Teensy'
  | 'Raid'
  | 'Encounter'
  | 'Exp'
  | 'Title'
  | 'Sparkling';

export const allTypes: TypeName[] = [
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

export const mealPowers: MealPower[] = [
  'Egg',
  'Catch',
  'Exp',
  'Item',
  'Raid',
  'Sparkling',
  'Title',
  'Humungo',
  'Teensy',
  'Encounter',
];

export type Flavor = 'Sweet' | 'Sour' | 'Salty' | 'Bitter' | 'Hot';

export const flavors: Flavor[] = ['Sweet', 'Sour', 'Salty', 'Bitter', 'Hot'];

export const isFlavor = (s: string): s is Flavor =>
  flavors.some((f) => f === s);
export const isMealPower = (s: string): s is MealPower =>
  mealPowers.some((mp) => mp === s);
export const isType = (s: string): s is TypeName =>
  allTypes.some((t) => t === s);
