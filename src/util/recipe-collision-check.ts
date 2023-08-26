import { recipes } from '@/data';
import { getPowersForIngredients, powerSetsMatch } from '@/mechanics';
import { makeSandwichForPowers } from '@/search';
import { getPowerCopy } from '@/strings';
import { Ingredient, Sandwich } from '@/types';

const main = async () => {
  for (const recipe of recipes) {
    const recipeIngredients: Ingredient[] = [
      ...recipe.fillings,
      ...recipe.condiments,
    ];

    const powers = getPowersForIngredients(recipeIngredients);

    const builtSandwich: Sandwich | null = await makeSandwichForPowers(powers);
    if (!builtSandwich) {
      console.log(`Check:${powers.map((p) => '\n\t' + getPowerCopy(p))}
Expected:${recipeIngredients.map((r) => '\n\t' + r.name)}`);
      continue;
    }
    if (
      builtSandwich.fillings.every((f1) =>
        recipe.fillings.some((f2) => f1.name === f2.name),
      ) &&
      builtSandwich.condiments.every((c1) =>
        recipe.condiments.some((c2) => c1.name === c2.name),
      ) &&
      recipe.fillings.every((f1) =>
        builtSandwich.fillings.some((f2) => f1.name === f2.name),
      ) &&
      recipe.condiments.every((c1) =>
        builtSandwich.condiments.some((c2) => c1.name === c2.name),
      ) &&
      !powerSetsMatch(recipe.powers, powers)
    ) {
      console.log(`Check:${powers.map((p) => '\n\t' + getPowerCopy(p))}`);
    }
  }
  console.log('Done');
};

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
