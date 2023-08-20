import { MealPower, TypeIndex } from './enum';

export interface Power {
  mealPower: MealPower;
  type: TypeIndex;
  level: number;
}

export interface Ingredient {
  name: string;
  isHerbaMystica: boolean;
  metaVector: number[];
  flavorVector: number[];
  baseMealPowerVector: number[];
  typeVector: number[];
  imagePath: string;
  pieces: number;
  ingredientType: 'filling' | 'condiment';
}

export interface Sandwich {
  fillings: Ingredient[];
  condiments: Ingredient[];
  // mealPowerBoosts: number[];
  // typeBoosts: number[];
  // flavorBoosts: number[];
  powers: Power[];
  score: number;
}

export interface SandwichRecipe {
  number: string;
  name: string;
  fillings: Ingredient[];
  condiments: Ingredient[];
  powers: Power[];
  imagePath: string;
  gameLocation: string;
}

export interface Meal {
  name: string;
  cost: number;
  powers: Power[];
  shop: string;
  towns: string[];
  imagePath: string;
}

export type LinearVariables = {
  constraints: {
    multiplayerPieces: Record<string, { max: number }>;
    singlePlayerPieces: Record<string, { max: number }>;
  };
  variables: {
    flavorValueDifferences: Record<string, number | undefined>[][];
  };
};
