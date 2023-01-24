import { useMemo } from 'react';
import { ingredients } from '../data';
import { Ingredient } from '../types';

const ingredientNames = ingredients.map((i) => i.name);
const sortIngredientCounts = (counts: Record<string, number>) =>
  Object.entries(counts)
    .map(([name, count]) => {
      const index = ingredientNames.indexOf(name);
      return { name, count, index, imagePath: ingredients[index].imagePath };
    })
    .sort((a, b) => a.index - b.index);

const ingredientCountReducer = (
  agg: Record<string, number>,
  ing: Ingredient,
) => {
  return {
    ...agg,
    [ing.name]: (agg[ing.name] || 0) + 1,
  };
};

interface RecipeListProps {
  fillings: Ingredient[];
  condiments: Ingredient[];
  className?: string;
}

const RecipeList = ({ fillings, condiments, className }: RecipeListProps) => {
  const fillingCounts = useMemo(() => {
    const counts = fillings.reduce(ingredientCountReducer, {});
    return sortIngredientCounts(counts);
  }, [fillings]);

  const condimentCounts = useMemo(() => {
    const counts = condiments.reduce(ingredientCountReducer, {});
    return sortIngredientCounts(counts);
  }, [condiments]);

  return (
    <div className={className}>
      {fillingCounts.map(({ name, count, imagePath }) => (
        <div key={name}>
          {count}x <img src={`assets/${imagePath}`} /> {name}
        </div>
      ))}
      {condimentCounts.map(({ name, count, imagePath }) => (
        <div key={name}>
          {count}x <img src={`assets/${imagePath}`} /> {name}
        </div>
      ))}
    </div>
  );
};

export default RecipeList;
