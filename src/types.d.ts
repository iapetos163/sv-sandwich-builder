import { Flavor, MealPower, TypeName } from './strings';

export interface Power {
  mealPower: MealPower;
  type: TypeName;
  level: number;
}

export interface Sandwich {
  fillings: Ingredient[];
  condiments: Ingredient[];
  mealPowerBoosts: Partial<Record<MealPower, number>>;
  typeBoosts: Partial<Record<TypeName, number>>;
  flavorBoosts: Partial<Record<Flavor, number>>;
}

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
