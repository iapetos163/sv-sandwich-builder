import { Flavor, MealPower, TypeName } from '../strings';
import ingredientsData from './ingredients.json';

export interface Ingredient {
  name: string;
  isHerbaMystica: boolean;
  totalMealPowerBoosts: Partial<Record<MealPower, number>>;
  totalTypeBoosts: Partial<Record<TypeName, number>>;
  totalFlavorBoosts: Partial<Record<Flavor, number>>;
  baseMealPowerVector: number[];
  typeVector: number[];
  imagePath: string;
  pieces: number;
  ingredientType: 'filling' | 'condiment';
}

export const ingredients = ingredientsData as Ingredient[];
