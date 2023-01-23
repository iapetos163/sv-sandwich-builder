import { writeFile } from 'fs/promises';
import { basename, join as joinPath } from 'path';
import arg from 'arg';
import got from 'got';
import condiments from '../simulator-data/condiments.json';
import fillings from '../simulator-data/fillings.json';
import sandwiches from '../simulator-data/sandwiches.json';
import { allTypes } from '../src/strings';
import { Power } from '../src/types';

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

type RecipeEntry = {
  number: string;
  name: string;
  fillings: string[];
  condiments: string[];
  effects: Power[];
  imagePath: string;
  imageUrl: string;
  gameLocation: string;
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

  const recipeMealPowerNames = [
    'Egg Power',
    'Catching Power',
    'Exp. Point Power',
    'Item Drop Power',
    'Raid Power',
    'Sparkling Power',
    'Title Power',
    'Humungo Power',
    'Teensy Power',
    'Encounter Power',
  ];
  const parsedRecipes = sandwiches.map(
    ({
      name,
      number,
      fillings,
      condiments,
      effects,
      imageUrl,
      location,
    }): RecipeEntry => ({
      name,
      number,
      fillings,
      condiments,
      gameLocation: location,
      imageUrl,
      imagePath: basename(imageUrl),
      effects: effects.map(
        (effect: { name: string; type: string; level: string }): Power => ({
          mealPower: recipeMealPowerNames.indexOf(effect.name),
          type: effect.type ? allTypes.indexOf(effect.type) : 0,
          level: parseInt(effect.level),
        }),
      ),
    }),
  );

  const ingredientsData = parsedFillings.concat(parsedCondiments);
  const recipeData = parsedRecipes;

  const ingOutputPath = 'src/data/ingredients.json';
  await writeFile(ingOutputPath, JSON.stringify(ingredientsData));
  console.log(`Exported ${ingOutputPath}`);

  const recipeOutputPath = 'src/data/recipes.json';
  await writeFile(recipeOutputPath, JSON.stringify(recipeData));
  console.log(`Exported ${recipeOutputPath}`);

  if (args['--skip-images']) return;

  const imageSources: (IngredientEntry | RecipeEntry)[] = [
    ...ingredientsData,
    ...recipeData,
  ];
  for (const { imageUrl, imagePath } of imageSources) {
    const res = await got(imageUrl, {
      responseType: 'buffer',
    });
    const imgOutPath = joinPath('public/assets', basename(imagePath));
    await writeFile(imgOutPath, res.body);
    console.log(`Exported ${imgOutPath}`);
  }
};

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
