import { Flavor, MealPower, TypeName } from '../strings';
import ingredientsData from './ingredients.json';

export interface Ingredient {
  name: string;
  mealPowerBoosts: Record<MealPower, number | undefined>;
  typeBoosts: Record<TypeName, number | undefined>;
  flavorBoosts: Record<Flavor, number | undefined>;
  baseMealPowerVector: number[];
  tasteMealPowerVector: number[];
  typeVector: number[];
  imagePath: string;
  pieces: number;
  ingredientType: 'filling' | 'condiment';
}

export const ingredients = ingredientsData as Ingredient[];
