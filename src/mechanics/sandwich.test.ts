import { ingredients } from '@/data';
import { getPowersForIngredients } from './sandwich';

describe('getPowersForIngredients', () => {
  it('returns 3 powers', () => {
    const tomato = ingredients.find((i) => i.name === 'Cherry Tomatoes')!;
    const butter = ingredients.find((i) => i.name === 'Butter')!;
    const sandwichIngredients = [tomato, tomato, tomato, tomato, butter];
    const res = getPowersForIngredients(sandwichIngredients);
    expect(res).toHaveLength(3);
  });
});
