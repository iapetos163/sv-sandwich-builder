import { ingredients, Ingredient } from '../data';
import { Flavor, MealPower, TypeName } from '../strings';
import { add, diff, innerProduct, norm } from '../vector-math';
import { Boosts, addBoosts } from './boost';
import {
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
  getRelativeTasteVector,
  getBoostedMealPower,
  rankFlavorBoosts,
  FlavorBoost,
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
  remainingFillings: number;
  remainingCondiments: number;
  allowHerbaMystica: boolean;
  skipIngredients: Record<string, boolean>;
  currentFlavorBoosts: Boosts<Flavor>;
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

const getBaseDelta = (target: number[], current: number[]) => {
  const base = getBaseVector(current);
  return norm(diff(target, base));
};

const MP_FILLING = 21;
const MP_CONDIMENT = 21;
const TYPE_FILLING = 36;
const TYPE_CONDIMENT = 4;

export interface ScoreWeightProps {
  targetVector: number[];
  deltaVector: number[];
  currentVector: number[];
  remainingFillings: number;
  remainingCondiments: number;
}

export const getMpScoreWeight = ({
  targetVector,
  deltaVector,
  currentVector,
  remainingFillings,
  remainingCondiments,
}: ScoreWeightProps) => {
  const baseDelta = getBaseDelta(targetVector, currentVector);

  const urgency =
    norm(deltaVector) /
    (MP_FILLING * remainingFillings + MP_CONDIMENT * remainingCondiments);
  const weight = urgency / Math.max(baseDelta, 100);
  // console.debug(
  //   `${weight} = ${norm(
  //     deltaVector,
  //   )} / (${MP_FILLING} * ${remainingFillings} + ${MP_CONDIMENT} * ${remainingCondiments})`,
  // );
  return weight;
};

export const getTypeScoreWeight = ({
  targetVector,
  deltaVector,
  currentVector,
  remainingFillings,
  remainingCondiments,
}: ScoreWeightProps) => {
  const baseDelta = getBaseDelta(targetVector, currentVector);

  const weight =
    norm(deltaVector) /
    (baseDelta *
      (TYPE_FILLING * remainingFillings +
        TYPE_CONDIMENT * remainingCondiments));
  // console.debug(
  //   `${weight} = ${norm(
  //     deltaVector,
  //   )} / (${TYPE_FILLING} * ${remainingFillings} + ${TYPE_CONDIMENT} * ${remainingCondiments})`,
  // );
  return weight;
};

const selectIngredient = ({
  targetPower,
  currentBoostedMealPowerVector,
  currentTypeVector,
  currentFlavorBoosts,
  checkMealPower,
  checkType,
  checkLevel,
  skipIngredients,
  allowHerbaMystica,
  remainingCondiments,
  remainingFillings,
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

  const typeScoreWeight = checkType
    ? getTypeScoreWeight({
        targetVector: targetTypeVector,
        deltaVector: deltaTypeVector,
        currentVector: currentTypeVector,
        remainingFillings,
        remainingCondiments,
      })
    : 0;
  // console.debug({
  //   targetVector: targetLevelVector,
  //   deltaVector: deltaLevelVector,
  //   currentVector: currentTypeVector,
  //   remainingFillings,
  //   remainingCondiments,
  // });
  const levelScoreWeight = checkLevel
    ? getTypeScoreWeight({
        targetVector: targetLevelVector,
        deltaVector: deltaLevelVector,
        currentVector: currentTypeVector,
        remainingFillings,
        remainingCondiments,
      })
    : 0;
  const mealPowerScoreWeight = checkMealPower
    ? getMpScoreWeight({
        targetVector: targetMealPowerVector,
        deltaVector: deltaMealPowerVector,
        currentVector: currentBoostedMealPowerVector,
        remainingFillings,
        remainingCondiments,
      })
    : 0;

  let bestMealPowerProduct = -Infinity;
  let bestTypeProduct = -Infinity;
  let bestLevelProduct = -Infinity;

  const ingredientReducer = (
    agg: IngredientAggregation,
    ing: Ingredient,
  ): IngredientAggregation => {
    if (
      (remainingFillings <= 0 && ing.ingredientType === 'filling') ||
      (remainingCondiments <= 0 && ing.ingredientType === 'condiment') ||
      (!allowHerbaMystica && ing.isHerbaMystica) ||
      skipIngredients[ing.name]
    ) {
      return agg;
    }

    // if (ing.name === 'Banana')
    //   console.debug('BANAYNAY', {
    //     currentFlavorBoosts,
    //     primaryTasteVector: ing.primaryTasteMealPowerVector,
    //     secondaryTasteVector: ing.secondaryTasteMealPowerVector,
    //   });
    const relativeTasteVector = getRelativeTasteVector({
      currentFlavorBoosts,
      ingredientFlavorBoosts: ing.totalFlavorBoosts,
    });
    const boostedMealPowerVector = add(
      ing.baseMealPowerVector,
      relativeTasteVector,
    );

    const positiveBoostedMpNorm = norm(
      boostedMealPowerVector.map((c) => (c > 0 ? c : 0)),
    );
    const deltaMpNorm = norm(deltaMealPowerVector);
    const n1 = deltaMpNorm * positiveBoostedMpNorm; // * norm(targetMealPowerVector);
    const mealPowerProduct =
      checkMealPower && n1 !== 0
        ? innerProduct(boostedMealPowerVector, deltaMealPowerVector) / n1
        : 0;
    const postiveTypeNorm = norm(ing.typeVector.map((c) => (c > 0 ? c : 0)));
    const n2 = postiveTypeNorm * norm(deltaTypeVector); // norm(targetTypeVector);
    const typeProduct =
      checkType && n2 !== 0
        ? innerProduct(ing.typeVector, deltaTypeVector) / n2
        : 0;
    const n3 = norm(deltaLevelVector); // * norm(targetLevelVector);
    const levelProduct =
      n3 !== 0 ? innerProduct(ing.typeVector, deltaLevelVector) / n3 : 0;
    const ingScore =
      mealPowerProduct * mealPowerScoreWeight +
      typeProduct * typeScoreWeight +
      levelProduct * levelScoreWeight;

    if (
      ing.name === 'Potato Salad' ||
      ing.name === 'Banana' ||
      ing.name === 'Whipped Cream' ||
      ing.name === 'Rice'
    ) {
      console.debug(
        `${ing.name}:
    Raw scores: ${mealPowerProduct}, ${typeProduct}, ${levelProduct}
    Relative taste vector: ${relativeTasteVector}
    Boosted meal power vector: ${boostedMealPowerVector}
      n1: ${n1}`,
      );
    }
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
  Current T: ${currentTypeVector}
  Remaining fillings: ${remainingFillings}
  Remaining condiments: ${remainingCondiments}`);

  return bestIngredient;
};

// TODO: target more than one power
export const makeSandwichForPower = (targetPower: Power): Sandwich | null => {
  console.debug('~~~HAZ SANDWICH~~~');
  const fillings: Ingredient[] = [];
  const condiments: Ingredient[] = [];
  const skipIngredients: Record<string, boolean> = {};

  let currentBaseMealPowerVector: number[] = [];
  let currentTypeVector: number[] = [];
  let currentMealPowerBoosts: Partial<Record<MealPower, number>> = {};
  let currentFlavorBoosts: Partial<Record<Flavor, number>> = {};
  let currentTypeBoosts: Partial<Record<TypeName, number>> = {};
  let currentPowers: Power[] = [];
  let targetPowerFound = false;
  let boostedMealPower: MealPower | null = null;
  let rankedFlavorBoosts: FlavorBoost[] = [];
  let allowHerbaMystica =
    targetPower.mealPower === 'Sparkling' || targetPower.mealPower === 'Title';

  const checkType = mealPowerHasType(targetPower.mealPower);

  while (fillings.length < maxFillings || condiments.length < maxCondiments) {
    const currentBoostedMealPowerVector = boostedMealPower
      ? boostMealPowerVector(currentBaseMealPowerVector, boostedMealPower)
      : currentBaseMealPowerVector;

    //     console.log(`Current MP (Boosted): ${currentBoostedMealPowerVector}
    // Current T: ${currentTypeVector}`);
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
      remainingFillings:
        !targetPowerFound || fillings.length === 0
          ? maxFillings - fillings.length
          : 0,
      remainingCondiments:
        !targetPowerFound || condiments.length === 0
          ? maxCondiments - condiments.length
          : 0,
      currentFlavorBoosts,
      allowHerbaMystica,
      skipIngredients,
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
        skipIngredients[newIngredient.name] = true;
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
      newIngredient.totalMealPowerBoosts,
    );
    currentFlavorBoosts = addBoosts(
      currentFlavorBoosts,
      newIngredient.totalFlavorBoosts,
    );
    currentTypeBoosts = addBoosts(
      currentTypeBoosts,
      newIngredient.totalTypeBoosts,
    );
    rankedFlavorBoosts = rankFlavorBoosts(currentFlavorBoosts);
    boostedMealPower = getBoostedMealPower(rankedFlavorBoosts);

    if (condiments.filter((c) => c.isHerbaMystica).length >= 2) {
      allowHerbaMystica = false;
    }

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
