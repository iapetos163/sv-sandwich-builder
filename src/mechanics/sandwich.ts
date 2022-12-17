import { ingredients, Ingredient } from '../data';
import { add, diff, innerProduct, norm } from '../vector-math';
import {
  boostMealPowerVector,
  getMealPowerVector,
  getTypeVector,
  Power,
} from './powers';
import {
  makeGetRelativeTasteVector,
  getBoostedMealPower,
  rankFlavorBoosts,
} from './taste';

export interface Sandwich {
  ingredients: Ingredient[];
  condiments: Ingredient[];
  mealPowerBoosts: Record<string, number | undefined>;
  typeBoosts: Record<string, number | undefined>;
}

interface SelectIngredientProps {
  targetPower: Power;
  currentBaseMealPowerVector: number[];
  currentTypeVector: number[];
  checkType: boolean;
  allowFillings: boolean;
  allowCondiments: boolean;
  flavorBoosts: Record<string, number>;
}

type IngredientAggregation = {
  best: Ingredient;
  score: number;
};

const maxFillings = 6;
const maxCondiments = 4;
const emptySandwich: Sandwich = {
  ingredients: [],
  condiments: [],
  mealPowerBoosts: {},
  typeBoosts: {},
};

const selectIngredient = ({
  targetPower,
  currentBaseMealPowerVector,
  currentTypeVector,
  flavorBoosts,
  checkType,
  allowFillings,
  allowCondiments,
}: SelectIngredientProps) => {
  const targetMealPowerVector = getMealPowerVector(
    targetPower,
    norm(currentBaseMealPowerVector),
  );
  const targetTypeVector = checkType
    ? getTypeVector(targetPower, norm(currentBaseMealPowerVector))
    : currentTypeVector;

  const rankedFlavorBoosts = rankFlavorBoosts(flavorBoosts);
  const boostedMealPower = getBoostedMealPower(rankedFlavorBoosts);
  const currentBoostedMealPowerVector = boostedMealPower
    ? boostMealPowerVector(currentBaseMealPowerVector, boostedMealPower)
    : currentBaseMealPowerVector;

  const deltaMealPowerVector = diff(
    targetMealPowerVector,
    currentBoostedMealPowerVector,
  );
  const deltaTypeVector = diff(targetTypeVector, currentTypeVector);

  const getRelativeTasteVector = makeGetRelativeTasteVector(
    flavorBoosts,
    rankedFlavorBoosts,
    boostedMealPower,
    targetPower.mealPower,
  );

  const ingredientReducer = (
    agg: IngredientAggregation,
    ing: Ingredient,
  ): IngredientAggregation => {
    if (
      (!allowFillings && ing.ingredientType === 'filling') ||
      (!allowCondiments && ing.ingredientType === 'condiment')
    ) {
      return agg;
    }

    const relativeTasteVector = getRelativeTasteVector(
      ing.tasteMealPowerVector,
    );
    const mealPowerProduct = innerProduct(
      add(ing.baseMealPowerVector, relativeTasteVector),
      deltaMealPowerVector,
    );

    const typeProduct = checkType
      ? innerProduct(ing.typeVector, deltaTypeVector)
      : 0;
    const ingScore = mealPowerProduct + typeProduct;
    if (ingScore <= agg.score) {
      return agg;
    }
    return {
      best: ing,
      score: ingScore,
    };
  };

  const { best: bestIngredient } = ingredients.reduce<IngredientAggregation>(
    ingredientReducer,
    {
      best: {} as Ingredient,
      score: -Infinity,
    },
  );

  return bestIngredient;
};

// TO DO: target more than one power
const modifySandwichForPower = (
  baseSandwich: Sandwich,
  targetPower: Power,
): Sandwich | null => {
  const fillings = [...baseSandwich.ingredients];
  const condiments = [...baseSandwich.condiments];

  while (fillings.length < maxFillings || condiments.length < maxCondiments) {
    // TODO
    break;
  }
  return null;
};

// Learning: there can be no more than 12 of a single ingredient, or 15 in multiplayer
// Learning: Num pieces for an ingredient each count separately
// Learning: order is very important for types and powers
