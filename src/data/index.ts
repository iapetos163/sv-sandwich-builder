import { Flavor, MealPower, TypeName } from '../strings';
import ingredientsData from './ingredients.json';

export interface Ingredient {
  name: string;
  mealPowerBoosts: Partial<Record<MealPower, number>>;
  typeBoosts: Partial<Record<TypeName, number>>;
  flavorBoosts: Partial<Record<Flavor, number>>;
  baseMealPowerVector: number[];
  tasteMealPowerVector: number[];
  typeVector: number[];
  imagePath: string;
  pieces: number;
  ingredientType: 'filling' | 'condiment';
}

export const ingredients = ingredientsData as Ingredient[];
