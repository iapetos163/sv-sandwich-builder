import { Ingredient, SandwichRecipe } from '../types';
import ingredientsData from './ingredients.json';
import recipesData from './recipes.json';

export const ingredients = ingredientsData as Ingredient[];

export const recipes: SandwichRecipe[] = recipesData.map((recipe) => ({
  ...recipe,
  fillings: recipe.fillings.map(
    (fillingName) => ingredients.find((ing) => ing.name === fillingName)!,
  ),
  condiments: recipe.condiments.map(
    (condimentName) => ingredients.find((ing) => ing.name === condimentName)!,
  ),
}));
