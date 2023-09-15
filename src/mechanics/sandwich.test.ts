import { ingredients } from '@/data';
import { getPowersForIngredients } from './sandwich';

describe('getPowersForIngredients', () => {
  it('returns 3 powers', () => {
    const tomato = ingredients.find((i) => i.id === 'chtom')!;
    const butter = ingredients.find((i) => i.id === 'but')!;
    const sandwichIngredients = [tomato, tomato, tomato, tomato, butter];
    const res = getPowersForIngredients(sandwichIngredients);
    expect(res).toHaveLength(3);
  });
});
