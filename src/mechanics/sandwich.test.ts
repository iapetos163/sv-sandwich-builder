import { ingredients } from '@/data';
import { MealPower, TypeIndex } from '@/enum';
import { getPowersForIngredients } from './sandwich';
import { isHerbaMealPower } from '.';

describe('getPowersForIngredients', () => {
  it('returns 3 powers', () => {
    const tomato = ingredients.find((i) => i.id === 'chtom')!;
    const butter = ingredients.find((i) => i.id === 'but')!;
    const sandwichIngredients = [tomato, tomato, tomato, tomato, butter];
    const res = getPowersForIngredients(sandwichIngredients, {});
    expect(res).toHaveLength(3);
  });

  it('returns a power without specified meal power when hmany is present', () => {
    const tomato = ingredients.find((i) => i.id === 'chtom')!;
    const hmany = ingredients.find((i) => i.id === 'hmany')!;
    const res = getPowersForIngredients([tomato, hmany], {});

    const nonHerbaPowers = res.filter(
      (p) => p.mealPower === undefined || !isHerbaMealPower(p.mealPower),
    );
    const definedNonHerba = nonHerbaPowers.find(
      (p) => p.mealPower !== undefined,
    );
    expect(definedNonHerba).not.toBeDefined();
  });

  it('returns the correct powers for a PB and pickle sandwich', () => {
    const pb = ingredients.find((i) => i.id === 'pbtr')!;
    const pickle = ingredients.find((i) => i.id === 'pkl')!;

    const res = getPowersForIngredients([pickle, pb]);

    const eggPower = res.find((p) => p.mealPower === MealPower.EGG);
    expect(eggPower).toBeDefined();

    const catchFighting = res.find(
      (p) => p.mealPower === MealPower.CATCH && p.type === TypeIndex.FIGHTING,
    );
    expect(catchFighting).not.toBeDefined();
  });
});
