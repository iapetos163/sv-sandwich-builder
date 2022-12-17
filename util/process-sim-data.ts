import { writeFile } from 'fs/promises';
import { basename, join as joinPath } from 'path';
import arg from 'arg';
import got from 'got';
import condiments from '../simulator-data/condiments.json';
import fillings from '../simulator-data/fillings.json';
import { tasteVectors } from '../src/mechanics';
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
import { add, scale } from '../src/vector-math';

type IngredientEntry = {
  name: string;
  mealPowerBoosts: Record<MealPower, number>;
  typeBoosts: Record<TypeName, number>;
  flavorBoosts: Record<Flavor, number>;
  baseMealPowerVector: number[];
  tasteMealPowerVector: number[];
  typeVector: number[];
  imagePath: string;
  imageUrl: string;
  pieces: number;
  ingredientType: 'filling' | 'condiment';
};

const getFlavorBoosts = (tastes: { flavor: string; amount: number }[]) =>
  Object.fromEntries(
    tastes.map((p) => {
      if (!isFlavor(p.flavor)) {
        throw new Error(`Unrecognized flavor: ${p.flavor}`);
      }
      return [p.flavor, p.amount];
    }),
  ) as Record<Flavor, number>;

const getMealPowerBoosts = (powers: { type: string; amount: number }[]) =>
  Object.fromEntries(
    powers.map((p) => {
      if (!isMealPower(p.type)) {
        throw new Error(`Unrecognized meal power: ${p}`);
      }
      return [p.type, p.amount];
    }),
  ) as Record<MealPower, number>;

const getTypeBoosts = (types: { type: string; amount: number }[]) =>
  Object.fromEntries(
    types.map((p) => {
      if (!isType(p.type)) {
        throw new Error(`Unrecognized type: ${p}`);
      }
      return [p.type, p.amount];
    }),
  ) as Record<TypeName, number>;

const main = async () => {
  const args = arg({
    '--skip-images': Boolean,

    '-s': '--skip-images',
  });

  const parsedCondiments = condiments.map(
    ({ name, imageUrl, powers, types, tastes }): IngredientEntry => {
      const mealPowerBoosts = getMealPowerBoosts(powers);
      const typeBoosts = getTypeBoosts(types);
      const flavorBoosts = getFlavorBoosts(tastes);

      const baseMealPowerVector = mealPowers.map(
        (mp) => mealPowerBoosts[mp] ?? 0,
      );
      const tasteMealPowerVector = tastes.reduce<number[]>(
        (sum, c) => add(sum, scale(tasteVectors[c.flavor as Flavor], c.amount)),
        [],
      );
      const typeVector = allTypes.map((t) => typeBoosts[t] ?? 0);

      return {
        name,
        imagePath: basename(imageUrl),
        imageUrl,
        pieces: 1,
        mealPowerBoosts,
        typeBoosts,
        flavorBoosts,
        typeVector,
        baseMealPowerVector,
        tasteMealPowerVector,
        ingredientType: 'condiment',
      };
    },
  );

  const parsedFillings = fillings.map(
    ({ name, imageUrl, powers, types, tastes, pieces }): IngredientEntry => {
      const mealPowerBoosts = getMealPowerBoosts(powers);
      const typeBoosts = getTypeBoosts(types);
      const flavorBoosts = getFlavorBoosts(tastes);

      const baseMealPowerVector = mealPowers.map((mp) =>
        mealPowerBoosts[mp] ? mealPowerBoosts[mp] * pieces : 0,
      );
      const tasteMealPowerVector = tastes.reduce<number[]>(
        (sum, f) =>
          add(sum, scale(tasteVectors[f.flavor as Flavor], f.amount * pieces)),
        [],
      );
      const typeVector = allTypes.map((t) =>
        typeBoosts[t] ? typeBoosts[t] * pieces : 0,
      );

      return {
        name,
        imagePath: basename(imageUrl),
        imageUrl,
        pieces: 1,
        mealPowerBoosts,
        typeBoosts,
        flavorBoosts,
        typeVector,
        baseMealPowerVector,
        tasteMealPowerVector,
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
    const imgOutPath = joinPath('src/assets/dynamic', basename(imagePath));
    await writeFile(imgOutPath, res.body);
    console.log(`Exported ${imgOutPath}`);
  }
};

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
