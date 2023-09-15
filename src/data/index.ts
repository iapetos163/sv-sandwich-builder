import type { TypeIndex } from '@/enum';
import type {
  Ingredient,
  SandwichRecipe,
  Meal,
  LinearConstraints,
} from '@/types';
import ingredientsData from './ingredients.json';
import linearVarsData from './linear-vars.json';
import mealsData from './meals.json';
import optimalTypesData from './optimal-types.json';
import recipesData from './recipes.json';

export const ingredients = ingredientsData as Ingredient[];

export const recipes: SandwichRecipe[] = recipesData.map((recipe) => ({
  ...recipe,
  fillings: recipe.fillings.map(
    (fillingId) => ingredients.find((ing) => ing.id === fillingId)!,
  ),
  condiments: recipe.condiments.map(
    (condimentId) => ingredients.find((ing) => ing.id === condimentId)!,
  ),
}));

export const meals: Meal[] = mealsData;

export const linearConstraints = linearVarsData as unknown as LinearConstraints;

export const optimalTypes = optimalTypesData as unknown as Record<
  string,
  [TypeIndex, TypeIndex]
>;
