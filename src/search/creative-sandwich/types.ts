import type { Model } from '@/lp';
import type { Ingredient } from '@/types';
import type { Target } from './target';

export type SandwichResult = {
  score: number;
  fillings: Ingredient[];
  condiments: Ingredient[];
  optionalPieceDrops: Record<string, number>;
  requiredPieceDrops: Record<string, number>;
  model: Model;
  target: Target;
};
