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
    score: Record<string, number>;
    fillings: Record<string, number>;
    condiments: Record<string, number>;
    herba: Record<string, number>;
    herbaMealPowerValue: Record<string, number>;
  };
  variableSets: {
    flavorValueDifferences: Record<string, number>[][];
    mealPowerValueDifferences: Record<string, number>[][];
    typeValueDifferences: Record<string, number>[][];
  };
};
