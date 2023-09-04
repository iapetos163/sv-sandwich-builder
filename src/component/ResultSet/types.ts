import { Meal, Sandwich, SandwichRecipe } from '@/types';

export enum ResultState {
  INIT = 'init',
  CALCULATING = 'calculating',
  RESULT = 'result',
}

export enum ResultType {
  MEAL = 'meal',
  RECIPE = 'recipe',
  CREATIVE = 'creative',
}

export type MealResult = Meal & { resultType: ResultType.MEAL; number?: never };
export type RecipeResult = SandwichRecipe & { resultType: ResultType.RECIPE };
export type CreativeResult = Sandwich & {
  resultType: ResultType.CREATIVE;
  number?: never;
  name?: never;
};
export type Result = MealResult | RecipeResult | CreativeResult;
