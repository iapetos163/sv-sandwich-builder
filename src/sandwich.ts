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
  ingredientType: 'filling' | 'condiment';
}

export interface Sandwich {
  ingredients: Ingredient[];
  condiments: Ingredient[];
  mealPowerBoosts: Record<string, number>;
  typeBoosts: Record<string, number>;
}

interface SelectIngredientProps {
  targetPower: Power;
  baseMealPowerVector: number[];
  baseTypeVector: number[];
  checkType: boolean;
  allowIngredients: boolean;
  allowcondiments: boolean;
}

type IngredientAggregation = {
  best: Ingredient;
  score: number;
};

const maxIngredients = 6;
const maxcondiments = 4;
const emptySandwich: Sandwich = {
  ingredients: [],
  condiments: [],
  mealPowerBoosts: {},
  typeBoosts: {},
};

const selectIngredient = ({
  targetPower,
  baseMealPowerVector,
  baseTypeVector,
  checkType,
  allowIngredients,
  allowcondiments,
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
    (ingredientType: 'filling' | 'condiment') =>
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
      makeIngredientReducer('filling'),
      { best, score },
    ));
  }

  if (allowcondiments) {
    const { best: bestcondiments, score: condimentsScore } =
      data.ingredients.reduce(makeIngredientReducer('condiment'), {
        best,
        score,
      });
    if (condimentsScore > score) {
      best = bestcondiments;
    }
  }

  return best;
};

// TO DO: target more than one power
const modifySandwichForPower = (
  baseSandwich: Sandwich,
  targetPower: Power,
): Sandwich | null => {
  const fillings = [...baseSandwich.ingredients];
  const condiments = [...baseSandwich.condiments];

  while (
    fillings.length < maxIngredients ||
    condiments.length < maxcondiments
  ) {}
};

// Learning: there can be no more than 12 of a single ingredient, or 15 in multiplayer
// Learning: Num pieces for an ingredient each count separately
// Learning: order is very important for types and powers
