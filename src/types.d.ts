import { Flavor, MealPower, TypeName } from './strings';

export type Boosts<T extends string> = Partial<Record<T, number>>;

export interface Power {
  mealPower: MealPower;
  type: TypeName;
  level: number;
}

export interface Sandwich {
  fillings: Ingredient[];
  condiments: Ingredient[];
  mealPowerBoosts: Boosts<MealPower>;
  typeBoosts: Boosts<TypeName>;
  flavorBoosts: Boosts<Flavor>;
  powers: Power[];
}

export interface Ingredient {
  name: string;
  isHerbaMystica: boolean;
  totalMealPowerBoosts: Boosts<MealPower>;
  totalTypeBoosts: Boosts<TypeName>;
  totalFlavorBoosts: Boosts<Flavor>;
  baseMealPowerVector: number[];
  typeVector: number[];
  imagePath: string;
  pieces: number;
  ingredientType: 'filling' | 'condiment';
}
