import { MealPower, TypeIndex } from './enum';
import { Constraint, Objective } from './lp';

export interface ResultPower {
  mealPower?: MealPower;
  type: TypeIndex;
  level: number;
}

export interface TargetPower extends ResultPower {
  mealPower: MealPower;
}

export interface Ingredient {
  id: string;
  isHerbaMystica: boolean;
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
  optionalPieceDrops: Record<string, number>;
  requiredPieceDrops: Record<string, number>;
  powers: ResultPower[];
  score: number;
}

export interface SandwichRecipe {
  number: string;
  name: string;
  fillings: Ingredient[];
  condiments: Ingredient[];
  powers: TargetPower[];
  imagePath: string;
  gameLocation: string;
}

export interface Meal {
  name: string;
  cost: number;
  powers: TargetPower[];
  shop: string;
  towns: string[];
  imagePath: string;
}

export type LinearConstraints = {
  objective: Objective;
  constraintSets: {
    multiplayerPieces: Constraint[];
    singlePlayerPieces: Constraint[];
    flavorValueDifferences: Constraint[][];
    mealPowerValueDifferences: Constraint[][];
    typeValueDifferences: Constraint[][];
    typeDiff70: Constraint[][];
    typeDiff105: Constraint[][];
  };
  coefficientSets: {
    fillings: Record<string, number>;
    condiments: Record<string, number>;
    herba: Record<string, number>;
    typeValues: Record<string, number>[];
  };
  constraints: {
    herbaMealPowerValue: Constraint;
    specificHerba: Constraint;
    anyHerba: Constraint;
  };
};
