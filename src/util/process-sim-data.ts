import { writeFile } from 'fs/promises';
import { basename, join as joinPath } from 'path';
import arg from 'arg';
import got from 'got';
import ingredientNamesById from '@/data/ingredient-ids.json';
import { rangeTypes } from '@/enum';
import { allTypes } from '@/strings';
import { TargetPower, Ingredient } from '@/types';
import condiments from '../../source-data/condiments.json';
import fillings from '../../source-data/fillings.json';
import meals from '../../source-data/meals.json';
import sandwiches from '../../source-data/sandwiches.json';
import { getOptimalTypes } from './get-optimal-types';
import { generateLinearConstraints } from './linear-constraints';

type IngredientEntry = Ingredient & { imageUrl?: string };

type RecipeEntry = {
  number: string;
  name: string;
  fillings: string[];
  condiments: string[];
  powers: TargetPower[];
  imagePath: string;
  imageUrl: string;
  gameLocation: string;
};

type MealEntry = {
  name: string;
  cost: number;
  powers: TargetPower[];
  shop: string;
  towns: string[];
  imageUrl: string;
  imagePath: string;
};

type ImageSource = {
  imageUrl?: string;
  imagePath: string;
};

export const flavors = ['Sweet', 'Salty', 'Sour', 'Bitter', 'Hot'];

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

const dataMealPowerNames = [
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

const effectToPower = (effect: {
  name: string;
  type: string;
  level: string;
}): TargetPower => ({
  mealPower: dataMealPowerNames.indexOf(effect.name),
  type: effect.type ? allTypes.indexOf(effect.type) : 0,
  level: parseInt(effect.level),
});

const main = async () => {
  const args = arg({
    '--skip-images': Boolean,

    '-s': '--skip-images',
  });

  const ingredientIdsByName = Object.fromEntries(
    Object.entries(ingredientNamesById).map(([id, name]) => [name, id]),
  );

  const parsedCondiments = condiments.map(
    ({ name, imageUrl, powers, types, tastes }): IngredientEntry => {
      const flavorVector = getFlavorVector(tastes);
      const typeVector = getTypeVector(types);
      const mealPowerVector = getMealPowerVector(powers);
      return {
        id: ingredientIdsByName[name],
        isHerbaMystica: name.endsWith('Herba Mystica'),
        imagePath: `ingredient/${basename(imageUrl)}`,
        imageUrl,
        pieces: 1,
        flavorVector,
        typeVector,
        baseMealPowerVector: mealPowerVector,
        ingredientType: 'condiment',
      };
    },
  );

  parsedCondiments.push({
    id: 'hmany',
    ingredientType: 'condiment',
    isHerbaMystica: true,
    imagePath: 'ingredient/anyherbamystica.png',
    pieces: 1,
    flavorVector: [],
    typeVector: rangeTypes.map(() => 250),
    baseMealPowerVector: getMealPowerVector([
      { type: 'Title', amount: 1000 },
      { type: 'Sparkling', amount: 1000 },
    ]),
  });

  const parsedFillings = fillings.map(
    ({ name, imageUrl, powers, types, tastes, pieces }): IngredientEntry => {
      const flavorVector = getFlavorVector(tastes);
      const typeVector = getTypeVector(types);
      const mealPowerVector = getMealPowerVector(powers);
      return {
        pieces,
        id: ingredientIdsByName[name],
        isHerbaMystica: false,
        imagePath: `ingredient/${basename(imageUrl)}`,
        imageUrl,
        flavorVector,
        typeVector,
        baseMealPowerVector: mealPowerVector,
        ingredientType: 'filling',
      };
    },
  );

  const recipeData = sandwiches
    .filter((s) => s.number !== '-1' && s.number !== '0')
    .map(
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
        fillings: fillings.map((name) => ingredientIdsByName[name]),
        condiments: condiments.map((name) => ingredientIdsByName[name]),
        gameLocation: location,
        imageUrl,
        imagePath: `sandwich/${basename(imageUrl)}`,
        powers: effects.map(effectToPower),
      }),
    );

  const mealData = meals.map(
    ({ name, shop, towns, effects, cost, imageUrl }): MealEntry => ({
      name,
      shop,
      towns,
      cost: parseInt(cost),
      imageUrl,
      imagePath: `meal/${basename(imageUrl)}`,
      powers: effects.map(effectToPower),
    }),
  );

  const ingredientsData = parsedFillings.concat(parsedCondiments);

  const mealLocations = new Set<string>();
  mealData.forEach((meal) =>
    meal.towns.forEach((town) => mealLocations.add(town)),
  );

  const outputJson = async (filename: string, data: any) => {
    const outputPath = `src/data/${filename}`;
    await writeFile(outputPath, JSON.stringify(data));
    console.log(`Exported ${outputPath}`);
  };

  await outputJson('ingredients.json', ingredientsData);
  await outputJson('recipes.json', recipeData);
  await outputJson('meals.json', mealData);
  await outputJson('locations.json', Array.from(mealLocations));
  const lc = generateLinearConstraints(ingredientsData);
  await outputJson('linear-vars.json', lc);
  await outputJson(
    'optimal-types.json',
    await getOptimalTypes(lc, ingredientsData),
  );

  if (args['--skip-images']) return;

  const imageSources: ImageSource[] = [
    ...ingredientsData,
    ...recipeData,
    ...mealData,
  ];
  for (const { imageUrl, imagePath } of imageSources) {
    if (!imageUrl) return;
    const res = await got(imageUrl, {
      responseType: 'buffer',
    });
    const imgOutPath = joinPath('public/assets', imagePath);
    await writeFile(imgOutPath, res.body);
    console.log(`Exported ${imgOutPath}`);
  }
};

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
