import { recipes } from '@/data';
import { getPowersForIngredients, powerSetsMatch } from '@/mechanics';
import { makeSandwichesForPowers } from '@/search';
import { getPowerCopy } from '@/strings';

const main = async () => {
  for (const recipe of recipes) {
    const recipeIngredients = [...recipe.fillings, ...recipe.condiments];

    const powers = getPowersForIngredients(recipeIngredients);

    const builtSandwiches = await makeSandwichesForPowers(powers);
    if (builtSandwiches.length === 0) {
      console.log(`Check:${powers.map((p) => '\n\t' + getPowerCopy(p))}
Expected:${recipeIngredients.map((r) => '\n\t' + r.name)}`);
      continue;
    }
    for (const builtSandwich of builtSandwiches) {
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
  }
  console.log('Done');
};

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
