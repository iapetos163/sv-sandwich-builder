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
  level: number;
}

const getMealPowerVector = ({ mealPower, level }: Power, matchNorm: number) => {
  let minNorm = 1;
  if (level === 2) minNorm = 100;
  if (level === 3) minNorm = 2000;
  const norm = Math.max(minNorm, matchNorm);
  return mealPowers.map((mp) => (mp === mealPower ? norm : 0));
};

const getTypeVector = (power: Power, matchNorm: number) =>
  allTypes.map((t) => (t === power.type ? matchNorm : 0));

const maxIngredients = 6;

const maxSeasonings = 4;
