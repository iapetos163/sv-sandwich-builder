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
  checkMealPower: boolean;
  checkType: boolean;
  checkLevel: boolean;
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
  checkMealPower,
  checkType,
  checkLevel,
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
  const mealPowerScoreWeight = checkMealPower
    ? getScoreWeight(
        targetMealPowerVector,
        deltaMealPowerVector,
        currentBoostedMealPowerVector,
      )
    : 0;
  const typeScoreWeight = checkType
    ? getScoreWeight(targetTypeVector, deltaTypeVector, currentTypeVector)
    : 0;
  const levelScoreWeight = checkLevel
    ? getScoreWeight(targetLevelVector, deltaLevelVector, currentTypeVector)
    : 0;

  let bestMealPowerProduct = -Infinity;
  let bestTypeProduct = -Infinity;
  let bestLevelProduct = -Infinity;

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

    // Fixme: taste meal power vector depends on current flavor boosts
    const relativeTasteVector = getRelativeTasteVector(
      ing.tasteMealPowerVector,
    );
    const boostedMealPowerVector = add(
      ing.baseMealPowerVector,
      relativeTasteVector,
    );
    const n1 = norm(boostedMealPowerVector.map((c) => (c > 0 ? c : 0)));
    const mealPowerProduct =
      checkMealPower && n1 !== 0
        ? innerProduct(boostedMealPowerVector, deltaMealPowerVector) / n1
        : 0;

    const n2 = norm(ing.typeVector.map((c) => (c > 0 ? c : 0)));
    const typeProduct =
      checkType && n2 !== 0
        ? innerProduct(ing.typeVector, deltaTypeVector) / n2
        : 0;
    const levelProduct = innerProduct(ing.typeVector, deltaLevelVector);
    const ingScore =
      mealPowerProduct * mealPowerScoreWeight +
      typeProduct * typeScoreWeight +
      levelProduct * levelScoreWeight;

    //   if (
    //     ing.name === 'Banana' ||
    //     ing.name === 'Cherry Tomatoes' ||
    //     ing.name === 'Jam'
    //   ) {
    //     console.debug(
    //       `${ing.name}:
    // Raw scores: ${mealPowerProduct}, ${typeProduct}, ${levelProduct}
    // Taste meal power vector: ${ing.tasteMealPowerVector},
    // Relative taste vector: ${relativeTasteVector}
    // Boosted meal power vector: ${boostedMealPowerVector}`,
    //     );
    //   }
    if (ingScore <= agg.score) {
      return agg;
    }
    bestMealPowerProduct = mealPowerProduct;
    bestTypeProduct = typeProduct;
    bestLevelProduct = levelProduct;
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
  console.debug(`Selecting ${bestIngredient.name}
  Weights: ${mealPowerScoreWeight}, ${typeScoreWeight}, ${levelScoreWeight}
  Raw scores: ${bestMealPowerProduct}, ${bestTypeProduct}, ${bestLevelProduct}

  Target MP: ${targetMealPowerVector}
  Delta MP: ${deltaMealPowerVector}
  Current MP: ${currentBoostedMealPowerVector}
  Target T: ${targetTypeVector}
  Delta T: ${deltaTypeVector}
  Target L: ${targetLevelVector}
  Delta L: ${deltaLevelVector}
  Current T: ${currentTypeVector}`);

  return bestIngredient;
};

// TODO: target more than one power
export const makeSandwichForPower = (targetPower: Power): Sandwich | null => {
  console.log('~~~HAZ SANDWICH~~~');
  const fillings: Ingredient[] = [];
  const condiments: Ingredient[] = [];
  const skipFillings: Record<string, boolean> = {};
  if (
    targetPower.mealPower !== 'Sparkling' &&
    targetPower.mealPower !== 'Title'
  ) {
    for (const ingredient of ingredients) {
      if (ingredient.isHerbaMystica) {
        skipFillings[ingredient.name] = true;
      }
    }
  }

  let currentBaseMealPowerVector: number[] = [];
  let currentTypeVector: number[] = [];
  let currentMealPowerBoosts: Partial<Record<MealPower, number>> = {};
  let currentFlavorBoosts: Partial<Record<Flavor, number>> = {};
  let currentTypeBoosts: Partial<Record<TypeName, number>> = {};
  let currentPowers: Power[] = [];
  let targetPowerFound = false;

  const checkType = mealPowerHasType(targetPower.mealPower);

  while (fillings.length < maxFillings || condiments.length < maxCondiments) {
    const rankedFlavorBoosts = rankFlavorBoosts(currentFlavorBoosts);
    const boostedMealPower = getBoostedMealPower(rankedFlavorBoosts);
    const currentBoostedMealPowerVector = boostedMealPower
      ? boostMealPowerVector(currentBaseMealPowerVector, boostedMealPower)
      : currentBaseMealPowerVector;

    //     console.log(`Current MP (Boosted): ${currentBoostedMealPowerVector}
    // Current T: ${currentTypeVector}`);
    // console.log(
    //   'makeGet',
    //   currentFlavorBoosts,
    //   rankedFlavorBoosts,
    //   boostedMealPower,
    //   targetPower.mealPower,
    // );
    const selectedPower = currentPowers[0];
    const newIngredient = selectIngredient({
      targetPower,
      currentBoostedMealPowerVector,
      currentTypeVector,
      checkMealPower:
        targetPowerFound || selectedPower?.mealPower !== targetPower.mealPower,
      checkType:
        targetPowerFound ||
        (checkType && selectedPower?.type !== targetPower.type),
      checkLevel:
        !selectedPower?.level || selectedPower.level < targetPower.level,
      allowFillings:
        fillings.length < maxFillings &&
        (!targetPowerFound || fillings.length === 0),
      allowCondiments:
        condiments.length < maxCondiments &&
        (!targetPowerFound || condiments.length === 0),
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
      // console.log(newIngredient.name, numPieces);
      if (numPieces + newIngredient.pieces > maxPieces) {
        // console.log('Skipping', newIngredient.name);
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
      newIngredient.pieces,
    );
    currentFlavorBoosts = addBoosts(
      currentFlavorBoosts,
      newIngredient.flavorBoosts,
      newIngredient.pieces,
    );
    currentTypeBoosts = addBoosts(
      currentTypeBoosts,
      newIngredient.typeBoosts,
      newIngredient.pieces,
    );

    // console.log(currentMealPowerBoosts, boostedMealPower, currentTypeBoosts);

    currentPowers = evaluateBoosts(
      currentMealPowerBoosts,
      boostedMealPower,
      currentTypeBoosts,
    );
    console.log(
      `Current powers:${['', ...currentPowers.map(powerToString)].join(
        '\n  ',
      )}`,
    );
    targetPowerFound = currentPowers.some((p) => powersMatch(p, targetPower));

    if (targetPowerFound && fillings.length > 0 && condiments.length > 0) {
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
