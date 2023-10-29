import { recipes } from '@/data';
import { getPowersForIngredients, powerSetsMatch } from '@/mechanics';
import { makeSandwichesForPowers } from '@/search';
import { getPowerCopy } from '@/strings';
import { TargetPower } from '@/types';

const main = async () => {
  for (const recipe of recipes) {
    const recipeIngredients = [...recipe.fillings, ...recipe.condiments];

    const powers = getPowersForIngredients(
      recipeIngredients,
      {},
    ) as TargetPower[];

    const builtSandwiches = await makeSandwichesForPowers(powers);
    if (builtSandwiches.length === 0) {
      console.log(`Check:${powers.map((p) => '\n\t' + getPowerCopy(p))}
Expected:${recipeIngredients.map((r) => '\n\t' + r.id)}`);
      continue;
    }
    for (const builtSandwich of builtSandwiches) {
      if (
        builtSandwich.fillings.every((f1) =>
          recipe.fillings.some((f2) => f1.id === f2.id),
        ) &&
        builtSandwich.condiments.every((c1) =>
          recipe.condiments.some((c2) => c1.id === c2.id),
        ) &&
        recipe.fillings.every((f1) =>
          builtSandwich.fillings.some((f2) => f1.id === f2.id),
        ) &&
        recipe.condiments.every((c1) =>
          builtSandwich.condiments.some((c2) => c1.id === c2.id),
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
