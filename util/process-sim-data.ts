import { writeFile } from 'fs/promises';
import { basename, join as joinPath } from 'path';
import arg from 'arg';
import got from 'got';
import condiments from '../simulator-data/condiments.json';
import fillings from '../simulator-data/fillings.json';
import { allTypes } from '../src/strings';

type IngredientEntry = {
  name: string;
  flavorVector: number[];
  baseMealPowerVector: number[];
  typeVector: number[];
  imagePath: string;
  imageUrl: string;
  pieces: number;
  isHerbaMystica: boolean;
  ingredientType: 'filling' | 'condiment';
};

export const flavors = ['Sweet', 'Sour', 'Salty', 'Bitter', 'Hot'];

export const mealPowers = [
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

const getFlavorVector = (
  flavorBoosts: { flavor: string; amount: number }[],
  pieces = 1,
) => {
  const boosts = Object.fromEntries(
    flavorBoosts.map((p) => {
      if (!flavors.includes(p.flavor)) {
        throw new Error(`Unrecognized flavor: ${p.flavor}`);
      }
      return [p.flavor, p.amount * pieces];
    }),
  );
  return flavors.map((f) => boosts[f] || 0);
};

const getMealPowerVector = (
  powers: { type: string; amount: number }[],
  pieces = 1,
) => {
  const boosts = Object.fromEntries(
    powers.map((p) => {
      if (!mealPowers.includes(p.type)) {
        throw new Error(`Unrecognized meal power: ${p}`);
      }
      return [p.type, p.amount * pieces];
    }),
  );

  return mealPowers.map((mp) => boosts[mp] ?? 0);
};

const getTypeVector = (
  types: { type: string; amount: number }[],
  pieces = 1,
) => {
  const boosts = Object.fromEntries(
    types.map((p) => {
      if (!allTypes.includes(p.type)) {
        throw new Error(`Unrecognized type: ${p}`);
      }
      return [p.type, p.amount * pieces];
    }),
  );
  return allTypes.map((t) => boosts[t] ?? 0);
};

const main = async () => {
  const args = arg({
    '--skip-images': Boolean,

    '-s': '--skip-images',
  });

  const parsedCondiments = condiments.map(
    ({ name, imageUrl, powers, types, tastes }): IngredientEntry => ({
      name,
      isHerbaMystica: name.endsWith('Herba Mystica'),
      imagePath: basename(imageUrl),
      imageUrl,
      pieces: 1,
      flavorVector: getFlavorVector(tastes),
      typeVector: getTypeVector(types),
      baseMealPowerVector: getMealPowerVector(powers),
      ingredientType: 'condiment',
    }),
  );

  const parsedFillings = fillings.map(
    ({ name, imageUrl, powers, types, tastes, pieces }): IngredientEntry => ({
      pieces,
      name,
      isHerbaMystica: false,
      imagePath: basename(imageUrl),
      imageUrl,
      flavorVector: getFlavorVector(tastes, pieces),
      typeVector: getTypeVector(types, pieces),
      baseMealPowerVector: getMealPowerVector(powers, pieces),
      ingredientType: 'filling',
    }),
  );

  const outputData = parsedFillings.concat(parsedCondiments);

  const outputPath = 'src/data/ingredients.json';
  await writeFile(outputPath, JSON.stringify(outputData));
  console.log(`Exported ${outputPath}`);

  if (args['--skip-images']) return;
  for (const { imageUrl, imagePath } of outputData) {
    const res = await got(imageUrl, {
      responseType: 'buffer',
    });
    const imgOutPath = joinPath('public/asset', basename(imagePath));
    await writeFile(imgOutPath, res.body);
    console.log(`Exported ${imgOutPath}`);
  }
};

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
