import { ingredients, Ingredient } from '../data';
import { Flavor, MealPower, TypeName } from '../strings';
import { add, diff, innerProduct, norm } from '../vector-math';
import {
  addBoosts,
  boostMealPowerVector,
  evaluateBoosts,
  getBaseVector,
  getTargetLevelVector,
  getTargetMealPowerVector,
  getTargetTypeVector,
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
  currentBoostedMealPowerVector: number[];
  currentTypeVector: number[];
  checkType: boolean;
  allowFillings: boolean;
  allowCondiments: boolean;
  skipFillings: Record<string, boolean>;
  getRelativeTasteVector(base: number[]): number[];
}

type IngredientAggregation = {
  best: Ingredient;
  score: number;
};

// TODO: change these for multiplayer
const maxFillings = 6;
const maxCondiments = 4;
const maxPieces = 12;

export const emptySandwich: Sandwich = {
  fillings: [],
  condiments: [],
  mealPowerBoosts: {},
  flavorBoosts: {},
  typeBoosts: {},
};

const selectIngredient = ({
  targetPower,
  currentBoostedMealPowerVector,
  getRelativeTasteVector,
  currentTypeVector,
  checkType,
  allowFillings,
  allowCondiments,
  skipFillings,
}: SelectIngredientProps) => {
  const baseMealPowerVector = getBaseVector(currentBoostedMealPowerVector);
  const baseTypeVector = getBaseVector(currentTypeVector);
  const targetMealPowerVector = getTargetMealPowerVector(
    targetPower,
    currentBoostedMealPowerVector,
  );
  const targetTypeVector = checkType
    ? getTargetTypeVector(targetPower, currentTypeVector)
    : currentTypeVector;

  const targetLevelVector = getTargetLevelVector(
    targetPower,
    currentTypeVector,
  );
  const mealPowerBaseDelta = norm(
    diff(targetMealPowerVector, baseMealPowerVector),
  );
  const typeBaseDelta = norm(diff(targetTypeVector, baseTypeVector));
  const levelBaseDelta = norm(diff(targetLevelVector, baseTypeVector));
  const deltaMealPowerVector = diff(
    targetMealPowerVector,
    currentBoostedMealPowerVector,
  );
  const deltaTypeVector = diff(targetTypeVector, currentTypeVector);
  const deltaLevelVector = diff(targetLevelVector, currentTypeVector);
  const mealPowerScoreWeight =
    mealPowerBaseDelta !== 0
      ? norm(deltaMealPowerVector) / mealPowerBaseDelta
      : 0;
  const typeScoreWeight =
    typeBaseDelta !== 0 ? norm(deltaTypeVector) / typeBaseDelta : 0;
  const levelScoreWeight =
    levelBaseDelta !== 0 ? norm(deltaLevelVector) / levelBaseDelta : 0;

  // let bestMealPowerProduct = -Infinity;
  // let bestTypeProduct = -Infinity;

  const ingredientReducer = (
    agg: IngredientAggregation,
    ing: Ingredient,
  ): IngredientAggregation => {
    if (
      (!allowFillings && ing.ingredientType === 'filling') ||
      (!allowCondiments && ing.ingredientType === 'condiment') ||
      skipFillings[ing.name]
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
    const levelProduct = innerProduct(ing.typeVector, deltaLevelVector);
    const ingScore =
      mealPowerProduct * mealPowerScoreWeight +
      typeProduct * typeScoreWeight +
      levelProduct * levelScoreWeight;

    if (ingScore <= agg.score) {
      return agg;
    }
    // bestMealPowerProduct = mealPowerProduct;
    // bestTypeProduct = typeProduct;
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
  // console.log(
  //   `Selecting ${bestIngredient.name}: MP${bestMealPowerProduct} + T${bestTypeProduct}`,
  // );

  return bestIngredient;
};

// TODO: target more than one power
export const makeSandwichForPower = (targetPower: Power): Sandwich | null => {
  // const fillings = [...baseSandwich.ingredients];
  // const condiments = [...baseSandwich.condiments];
  const fillings: Ingredient[] = [];
  const condiments: Ingredient[] = [];
  const skipFillings: Record<string, boolean> = {};

  let currentBaseMealPowerVector: number[] = [];
  let currentTypeVector: number[] = [];
  let currentMealPowerBoosts: Partial<Record<MealPower, number>> = {};
  let currentFlavorBoosts: Partial<Record<Flavor, number>> = {};
  let currentTypeBoosts: Partial<Record<TypeName, number>> = {};

  const checkType = mealPowerHasType(targetPower.mealPower);

  while (fillings.length < maxFillings || condiments.length < maxCondiments) {
    const rankedFlavorBoosts = rankFlavorBoosts(currentFlavorBoosts);
    const boostedMealPower = getBoostedMealPower(rankedFlavorBoosts);
    const currentBoostedMealPowerVector = boostedMealPower
      ? boostMealPowerVector(currentBaseMealPowerVector, boostedMealPower)
      : currentBaseMealPowerVector;

    const newIngredient = selectIngredient({
      targetPower,
      currentBoostedMealPowerVector,
      currentTypeVector,
      checkType,
      allowFillings: fillings.length < maxFillings,
      allowCondiments: condiments.length < maxCondiments,
      getRelativeTasteVector: makeGetRelativeTasteVector(
        currentFlavorBoosts,
        rankedFlavorBoosts,
        boostedMealPower,
        targetPower.mealPower,
      ),
      skipFillings,
    });

    if (newIngredient.ingredientType === 'filling') {
      fillings.push(newIngredient);

      const numOfIngredient = fillings.filter(
        (f) => f.name === newIngredient.name,
      ).length;
      const numPieces = numOfIngredient * newIngredient.pieces;
      if (numPieces + newIngredient.pieces > maxPieces) {
        skipFillings[newIngredient.name] = true;
      }
    } else {
      condiments.push(newIngredient);
    }

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
      boostedMealPower,
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
