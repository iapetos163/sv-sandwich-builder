import { ingredients, Ingredient } from '../data';
import { Flavor, MealPower, TypeName } from '../strings';
import { add, diff, innerProduct, norm } from '../vector-math';
import {
  addBoosts,
  boostMealPowerVector,
  evaluateBoosts,
  getMealPowerVector,
  getTypeVector,
  mealPowerHasType,
  Power,
  powersMatch,
} from './powers';
import {
  makeGetRelativeTasteVector,
  getBoostedMealPower,
  rankFlavorBoosts,
} from './taste';

export interface Sandwich {
  fillings: Ingredient[];
  condiments: Ingredient[];
  mealPowerBoosts: Partial<Record<MealPower, number>>;
  typeBoosts: Partial<Record<TypeName, number>>;
  flavorBoosts: Partial<Record<Flavor, number>>;
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
export const emptySandwich: Sandwich = {
  fillings: [],
  condiments: [],
  mealPowerBoosts: {},
  flavorBoosts: {},
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
export const makeSandwichForPower = (targetPower: Power): Sandwich | null => {
  // const fillings = [...baseSandwich.ingredients];
  // const condiments = [...baseSandwich.condiments];
  const fillings: Ingredient[] = [];
  const condiments: Ingredient[] = [];

  let currentBaseMealPowerVector: number[] = [];
  let currentTypeVector: number[] = [];
  let currentMealPowerBoosts: Partial<Record<MealPower, number>> = {};
  let currentFlavorBoosts: Partial<Record<Flavor, number>> = {};
  let currentTypeBoosts: Partial<Record<TypeName, number>> = {};

  const checkType = mealPowerHasType(targetPower.mealPower);

  while (fillings.length < maxFillings || condiments.length < maxCondiments) {
    const newIngredient = selectIngredient({
      targetPower,
      currentBaseMealPowerVector,
      currentTypeVector,
      checkType,
      allowFillings: fillings.length < maxFillings,
      allowCondiments: condiments.length < maxCondiments,
      flavorBoosts: currentFlavorBoosts,
    });

    currentBaseMealPowerVector = add(
      currentBaseMealPowerVector,
      newIngredient.baseMealPowerVector,
    );
    currentTypeVector = add(
      currentBaseMealPowerVector,
      newIngredient.typeVector,
    );
    currentMealPowerBoosts = addBoosts(
      currentMealPowerBoosts,
      newIngredient.mealPowerBoosts,
    );
    currentFlavorBoosts = addBoosts(
      currentFlavorBoosts,
      newIngredient.flavorBoosts,
    );
    currentTypeBoosts = addBoosts(currentTypeBoosts, newIngredient.typeBoosts);

    const currentPowers = evaluateBoosts(
      currentMealPowerBoosts,
      currentTypeBoosts,
    );
    if (currentPowers.some((p) => powersMatch(p, targetPower))) {
      return {
        fillings,
        condiments,
        typeBoosts: currentTypeBoosts,
        flavorBoosts: currentFlavorBoosts,
        mealPowerBoosts: currentMealPowerBoosts,
      };
    }
  }

  return null;
};

// Learning: there can be no more than 12 of a single ingredient, or 15 in multiplayer
// Learning: Num pieces for an ingredient each count separately
// Learning: order is very important for types and powers
