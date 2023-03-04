import { Ingredient, SandwichRecipe, Meal } from '../types';
import ingredientsData from './ingredients.json';
import matrixData from './matrix.json';
import mealsData from './meals.json';
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

export const meals: Meal[] = mealsData;

export const ingredientMatrix: number[][] = matrixData;
