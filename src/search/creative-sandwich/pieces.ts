import { getPowersForIngredients, powerSetsMatch } from '@/mechanics';
import { SandwichResult } from './types';

export const combineDrops = (
  a: Record<string, number>,
  b: Record<string, number>,
) => ({
  ...a,
  ...Object.fromEntries(
    Object.entries(b).map(([key, bVal]) => [key, bVal + (a[key] || 0)]),
  ),
});

export const adjustForDroppedPieces = (
  sandwich: SandwichResult,
): SandwichResult | null => {
  const ingredients = sandwich.fillings.concat(sandwich.condiments);

  const resultRequiredDrops: Record<string, number> =
    sandwich.requiredPieceDrops;
  const resultOptionalDrops: Record<string, number> = {};

  // TODO: prioritize fillings by difficulty
  for (const fillingId of Object.keys(resultRequiredDrops)) {
    const drops = combineDrops(resultRequiredDrops, resultOptionalDrops);
    let powers = getPowersForIngredients(ingredients, drops);

    // Remove required drops until sandwich doesn't have too many drops
    let numRequiredDrops = drops[fillingId];
    while (powers.length === 0 && numRequiredDrops > 0) {
      numRequiredDrops -= 1;
      powers = getPowersForIngredients(ingredients, {
        ...drops,
        [fillingId]: numRequiredDrops,
      });
    }

    // Still too many drops
    // Modify required drops and move on to next filling
    if (powers.length === 0) {
      resultRequiredDrops[fillingId] = numRequiredDrops;
      continue;
    }

    // Removing required drops made the sandwich no longer viable
    // Change nothing and try the next filling
    if (!powerSetsMatch(powers, sandwich.target.powers)) {
      continue;
    }

    // Now we have established that the sandwich doesn't have too many drops
    // Test making piece drops optional
    let numOptionalDrops = 0;
    while (
      powers.length > 0 &&
      powerSetsMatch(powers, sandwich.target.powers) &&
      numOptionalDrops < numRequiredDrops
    ) {
      numOptionalDrops += 1;
      const drops = {
        ...resultRequiredDrops,
        [fillingId]: numRequiredDrops - numOptionalDrops,
      };
      powers = getPowersForIngredients(ingredients, drops);
    }

    // Loop ended when sandwich was no longer viable
    // Roll back one dropped piece
    if (!powerSetsMatch(powers, sandwich.target.powers)) {
      numOptionalDrops -= 1;
    }
    // Ensure that numOptionalDrops is no more than maximum
    else {
      numOptionalDrops = Math.min(numRequiredDrops, numOptionalDrops);
    }

    resultRequiredDrops[fillingId] = numRequiredDrops - numOptionalDrops;
    resultOptionalDrops[fillingId] = numOptionalDrops;
  }

  const finalPowers = getPowersForIngredients(
    ingredients,
    combineDrops(resultRequiredDrops, resultOptionalDrops),
  );
  if (
    finalPowers.length === 0 ||
    !powerSetsMatch(finalPowers, sandwich.target.powers)
  ) {
    return null;
  }

  return {
    ...sandwich,
    requiredPieceDrops: resultRequiredDrops,
    optionalPieceDrops: resultOptionalDrops,
  };
};
