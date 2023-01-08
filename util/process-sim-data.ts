import { writeFile } from 'fs/promises';
import { basename, join as joinPath } from 'path';
import arg from 'arg';
import got from 'got';
import condiments from '../simulator-data/condiments.json';
import fillings from '../simulator-data/fillings.json';
import {
  Flavor,
  mealPowers,
  allTypes,
  MealPower,
  TypeName,
  isMealPower,
  isType,
  isFlavor,
} from '../src/strings';

type IngredientEntry = {
  name: string;
  totalMealPowerBoosts: Record<MealPower, number>;
  totalTypeBoosts: Record<TypeName, number>;
  totalFlavorBoosts: Record<Flavor, number>;
  baseMealPowerVector: number[];
  typeVector: number[];
  imagePath: string;
  imageUrl: string;
  pieces: number;
  isHerbaMystica: boolean;
  ingredientType: 'filling' | 'condiment';
};

const getFlavorBoosts = (
  tastes: { flavor: string; amount: number }[],
  pieces = 1,
) =>
  Object.fromEntries(
    tastes.map((p) => {
      if (!isFlavor(p.flavor)) {
        throw new Error(`Unrecognized flavor: ${p.flavor}`);
      }
      return [p.flavor, p.amount * pieces];
    }),
  ) as Record<Flavor, number>;

const getMealPowerBoosts = (
  powers: { type: string; amount: number }[],
  pieces = 1,
) =>
  Object.fromEntries(
    powers.map((p) => {
      if (!isMealPower(p.type)) {
        throw new Error(`Unrecognized meal power: ${p}`);
      }
      return [p.type, p.amount * pieces];
    }),
  ) as Record<MealPower, number>;

const getTypeBoosts = (types: { type: string; amount: number }[], pieces = 1) =>
  Object.fromEntries(
    types.map((p) => {
      if (!isType(p.type)) {
        throw new Error(`Unrecognized type: ${p}`);
      }
      return [p.type, p.amount * pieces];
    }),
  ) as Record<TypeName, number>;

const main = async () => {
  const args = arg({
    '--skip-images': Boolean,

    '-s': '--skip-images',
  });

  const parsedCondiments = condiments.map(
    ({ name, imageUrl, powers, types, tastes }): IngredientEntry => {
      const totalMealPowerBoosts = getMealPowerBoosts(powers);
      const totalTypeBoosts = getTypeBoosts(types);
      const totalFlavorBoosts = getFlavorBoosts(tastes);

      const baseMealPowerVector = mealPowers.map(
        (mp) => totalMealPowerBoosts[mp] ?? 0,
      );
      const typeVector = allTypes.map((t) => totalTypeBoosts[t] ?? 0);

      return {
        name,
        isHerbaMystica: name.endsWith('Herba Mystica'),
        imagePath: basename(imageUrl),
        imageUrl,
        pieces: 1,
        totalMealPowerBoosts,
        totalTypeBoosts,
        totalFlavorBoosts,
        typeVector,
        baseMealPowerVector,
        ingredientType: 'condiment',
      };
    },
  );

  const parsedFillings = fillings.map(
    ({ name, imageUrl, powers, types, tastes, pieces }): IngredientEntry => {
      const totalMealPowerBoosts = getMealPowerBoosts(powers, pieces);
      const totalTypeBoosts = getTypeBoosts(types, pieces);
      const totalFlavorBoosts = getFlavorBoosts(tastes, pieces);

      const baseMealPowerVector = mealPowers.map((mp) =>
        totalMealPowerBoosts[mp] ? totalMealPowerBoosts[mp] : 0,
      );
      const typeVector = allTypes.map((t) =>
        totalTypeBoosts[t] ? totalTypeBoosts[t] : 0,
      );

      return {
        name,
        isHerbaMystica: false,
        imagePath: basename(imageUrl),
        imageUrl,
        pieces,
        totalTypeBoosts,
        totalFlavorBoosts,
        totalMealPowerBoosts,
        typeVector,
        baseMealPowerVector,
        ingredientType: 'filling',
      };
    },
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
