import { Meal, Sandwich, SandwichRecipe } from '@/types';
import s from './ResultSet.module.css';

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

export type MealResult = Meal & { resultType: ResultType.MEAL };
export type RecipeResult = SandwichRecipe & { resultType: ResultType.RECIPE };
export type CreativeResult = Sandwich & { resultType: ResultType.CREATIVE };
export type Result = MealResult | RecipeResult | CreativeResult;
