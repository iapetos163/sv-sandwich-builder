import data from './data.json';
import { getMealPowerVector, getTypeVector, Power } from './powers';
import { diff, innerProduct, norm } from './vector-math';

export interface Ingredient {
  ingredientImageBasename: string;
  ingredientPagePath: string;
  ingredientName: string;
  mealPowerBoosts: Record<string, number | undefined>;
  typeBoosts: Record<string, number | undefined>;
  mealPowerVector: number[];
  typeVector: number[];
  ingredientType: 'ingredient' | 'seasoning';
}

interface SelectIngredientProps {
  targetPower: Power;
  baseMealPowerVector: number[];
  baseTypeVector: number[];
  checkType: boolean;
  allowIngredients: boolean;
  allowSeasoning: boolean;
}

type IngredientAggregation = {
  best: Ingredient;
  score: number;
};

const selectIngredient = ({
  targetPower,
  baseMealPowerVector,
  baseTypeVector,
  checkType,
  allowIngredients,
  allowSeasoning,
}: SelectIngredientProps) => {
  const mealPowerVector = getMealPowerVector(
    targetPower,
    norm(baseMealPowerVector),
  );
  const typeVector = checkType
    ? getTypeVector(targetPower, norm(baseMealPowerVector))
    : [];

  const targetMealPowerVector = diff(mealPowerVector, baseMealPowerVector);
  const targetTypeVector = diff(typeVector, baseTypeVector);

  const makeIngredientReducer =
    (ingredientType: 'ingredient' | 'seasoning') =>
    (
      agg: IngredientAggregation,
      ing: Omit<Ingredient, 'ingredientType'>,
    ): IngredientAggregation => {
      const mealPowerProduct = innerProduct(
        ing.mealPowerVector,
        targetMealPowerVector,
      );
      const typeProduct = checkType
        ? innerProduct(ing.typeVector, targetTypeVector)
        : 0;
      const ingScore = mealPowerProduct + typeProduct;
      if (ingScore <= agg.score) {
        return agg;
      }
      return {
        best: { ingredientType, ...ing },
        score: ingScore,
      };
    };

  let best = {} as Ingredient;
  let score = -Infinity;

  if (allowIngredients) {
    ({ best, score } = data.ingredients.reduce(
      makeIngredientReducer('ingredient'),
      { best, score },
    ));
  }

  if (allowSeasoning) {
    const { best: bestSeasoning, score: seasoningScore } =
      data.ingredients.reduce(makeIngredientReducer('seasoning'), {
        best,
        score,
      });
    if (seasoningScore > score) {
      best = bestSeasoning;
    }
  }

  return best;
};

const maxIngredients = 6;

const maxSeasonings = 4;
