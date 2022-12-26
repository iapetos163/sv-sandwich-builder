import { ingredients, Ingredient } from '../data';
import { Flavor, MealPower, TypeName } from '../strings';
import { add, diff, innerProduct, norm } from '../vector-math';
import {
  addBoosts,
  boostMealPowerVector,
  evaluateBoosts,
  getTargetLevelVector,
  getTargetMealPowerVector,
  getTargetTypeVector,
  mealPowerHasType,
  Power,
  powersMatch,
  powerToString,
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

const getBaseVector = (currentVector: number[]) => {
  // const minComponent = Math.min(...currentVector);
  return currentVector.map((comp) => (comp >= 0 ? 0 : comp));
};

const getScoreWeight = (
  target: number[],
  delta: number[],
  current: number[],
) => {
  const base = getBaseVector(current);
  const baseDelta = norm(diff(target, base));
  return baseDelta !== 0 ? norm(delta) / baseDelta : 0;
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
  const deltaMealPowerVector = diff(
    targetMealPowerVector,
    currentBoostedMealPowerVector,
  );
  const deltaTypeVector = diff(targetTypeVector, currentTypeVector);
  const deltaLevelVector = diff(targetLevelVector, currentTypeVector);
  const mealPowerScoreWeight = getScoreWeight(
    targetMealPowerVector,
    deltaMealPowerVector,
    currentBoostedMealPowerVector,
  );
  const typeScoreWeight = getScoreWeight(
    targetTypeVector,
    deltaTypeVector,
    currentTypeVector,
  );
  const levelScoreWeight = getScoreWeight(
    targetLevelVector,
    deltaLevelVector,
    currentTypeVector,
  );

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
  console.log(`Selecting ${bestIngredient.name}
Weights: ${mealPowerScoreWeight}, ${typeScoreWeight}, ${levelScoreWeight}
Target L: ${targetLevelVector}
Delta L: ${deltaLevelVector}
Current T: ${currentTypeVector}`);

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

    //     console.log(`Current MP (Boosted): ${currentBoostedMealPowerVector}
    // Current T: ${currentTypeVector}`);
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
    currentTypeVector = add(currentTypeVector, newIngredient.typeVector);
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
    console.log(`Current powers:
  ${currentPowers.map(powerToString).join('\n  ')}`);
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
