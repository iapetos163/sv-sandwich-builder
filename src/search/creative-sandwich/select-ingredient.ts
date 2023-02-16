import { ingredients } from '../../data';
import { TypeBoost, MealPowerBoost } from '../../mechanics';
import { Ingredient, Power } from '../../types';
import { add, diff, innerProduct, norm, scale } from '../../vector-math';
import { TargetConfig, getTypeTargetsByPlace } from './target';
import {
  getRelativeTasteVector,
  getTargetLevelVector,
  getTargetMealPowerVector,
  getTargetTypeVector,
} from './vector';

const TARGET_SCORE_THRESHOLD = 0.2; // 0.2
const INGREDIENT_SCORE_THRESHOLD = 0.2;
const MAX_CANDIDATES = 3;

const MP_FILLING = 21;
const MP_CONDIMENT = 21;
const TYPE_FILLING = 36;
const TYPE_CONDIMENT = 4;

export const emptySandwich = {
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
  return weight;
};

type ScoredIngredient = {
  ing: Ingredient;
  score: number;
};

type Target = {
  targetTypeVector: number[];
  targetLevelVector: number[];
  deltaTypeVector: number[];
  deltaLevelVector: number[];
  deltaTypeNorm: number;
  deltaLevelNorm: number;
  targetConfigSet: TargetConfig[];
};

export interface SelectIngredientProps {
  targetPowers: Power[];
  targetConfigSets: TargetConfig[][];
  currentBoostedMealPowerVector: number[];
  currentTypeVector: number[];
  rankedTypeBoosts: TypeBoost[];
  rankedMealPowerBoosts: MealPowerBoost[];
  checkMealPower: boolean;
  checkType: boolean;
  checkLevel: boolean;
  remainingFillings: number;
  remainingCondiments: number;
  allowHerbaMystica: boolean;
  skipIngredients: Record<string, boolean>;
  currentFlavorVector: number[];
  debug?: boolean;
}

export const selectIngredientCandidates = ({
  targetPowers,
  targetConfigSets,
  currentBoostedMealPowerVector,
  currentTypeVector,
  rankedTypeBoosts,
  rankedMealPowerBoosts,
  currentFlavorVector,
  checkMealPower,
  checkType,
  checkLevel,
  skipIngredients,
  allowHerbaMystica,
  remainingCondiments,
  remainingFillings,
  debug,
}: SelectIngredientProps) => {
  // const repeatedType = getRepeatedType(targetPowers);
  const condimentBonus = targetPowers.length === 1 ? 0.4 : 0;
  const capTypeProducts = targetPowers.length === 1;
  const capLevelProducts = targetPowers.every((tp) => tp.level === 1); // && repeatedType;

  const zeroTarget: Target = {
    targetTypeVector: [],
    targetLevelVector: [],
    deltaTypeVector: [],
    deltaLevelVector: [],
    deltaTypeNorm: Infinity,
    deltaLevelNorm: Infinity,
    targetConfigSet: targetConfigSets[0],
  };

  const [targets] = targetConfigSets.reduce(
    (
      [selectedTargets, prevMaxDeltaNorm],
      targetConfigSet,
    ): [Target[], number] => {
      const targetTypes = getTypeTargetsByPlace(
        targetPowers,
        targetConfigSet.map((c) => c.typePlaceIndex),
        rankedTypeBoosts,
      );
      const targetTypeVector = checkType
        ? getTargetTypeVector({
            targetPowers,
            targetConfigSet,
            rankedTypeBoosts,
            targetTypeIndices: targetTypes,
            typeVector: currentTypeVector,
          })
        : currentTypeVector;

      const targetLevelVector = getTargetLevelVector({
        targetPowers,
        targetConfigSet,
        targetTypes,
        typeVector: currentTypeVector,
      });
      const deltaTypeVector = diff(targetTypeVector, currentTypeVector);
      const deltaLevelVector = diff(targetLevelVector, currentTypeVector);
      const deltaTypeNorm = norm(deltaTypeVector);
      const deltaLevelNorm = norm(deltaLevelVector);

      const maxDeltaNorm = Math.max(deltaLevelNorm, deltaTypeNorm);
      if (maxDeltaNorm <= prevMaxDeltaNorm * (1 + TARGET_SCORE_THRESHOLD)) {
        const leastMax = Math.min(maxDeltaNorm, prevMaxDeltaNorm);
        const target = {
          targetTypeVector,
          targetLevelVector,
          deltaTypeVector,
          deltaLevelVector,
          deltaTypeNorm,
          deltaLevelNorm,
          targetConfigSet,
        };
        if (debug) {
          for (const t of selectedTargets) {
            if (
              Math.max(t.deltaLevelNorm, t.deltaTypeNorm) >
              leastMax * (1 + TARGET_SCORE_THRESHOLD)
            ) {
              console.debug(`Discarding config set: ${[
                '',
                ...t.targetConfigSet.map((c) => JSON.stringify(c)),
              ].join(`
          `)}
        Delta type norm: ${t.deltaTypeNorm}
        Delta level norm: ${t.deltaLevelNorm}`);
            }
          }
        }
        return [
          [
            ...selectedTargets.filter(
              (t) =>
                Math.max(t.deltaLevelNorm, t.deltaTypeNorm) <=
                leastMax * (1 + TARGET_SCORE_THRESHOLD),
            ),
            target,
          ],
          maxDeltaNorm,
        ];
      }
      return [selectedTargets, prevMaxDeltaNorm];
    },
    [[zeroTarget], Infinity],
  );

  if (
    targets[0].deltaTypeNorm === Infinity ||
    targets[0].deltaLevelNorm === Infinity
  ) {
    if (debug) {
      console.debug('Cannot satisfy constraints for target configs', {
        targetConfigSets,
        currentTypeVector,
        targets,
        targetPowers,
      });
    }
    return [];
  }

  const selectCandidatesForTarget = (target: Target) => {
    let {
      targetTypeVector,
      deltaTypeVector,
      deltaTypeNorm,
      targetConfigSet,
      targetLevelVector,
      deltaLevelVector,
      deltaLevelNorm,
    } = target;

    const targetMealPowerVector = getTargetMealPowerVector({
      targetPowers,
      targetConfigSet,
      rankedMealPowerBoosts,
      mealPowerVector: currentBoostedMealPowerVector,
    });

    if (debug) {
      console.debug({
        targetPowers,
        targetConfigSet,
        rankedMealPowerBoosts,
        mealPowerVector: currentBoostedMealPowerVector,
        targetMealPowerVector,
      });
    }

    const deltaMealPowerVector = diff(
      targetMealPowerVector,
      currentBoostedMealPowerVector,
    );
    const deltaMpNorm = norm(deltaMealPowerVector);

    let typeScoreWeight = checkType
      ? getTypeScoreWeight({
          targetVector: targetTypeVector,
          deltaVector: deltaTypeVector,
          currentVector: currentTypeVector,
          remainingFillings,
          remainingCondiments,
        })
      : 0;
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

    // In the case we are forced to pick an ingredient but we have what we need
    // Force a nonzero deltaTypeVector
    if (
      deltaTypeNorm === 0 &&
      typeScoreWeight === 0 &&
      mealPowerScoreWeight === 0
    ) {
      const targetTypeIndices = getTypeTargetsByPlace(
        targetPowers,
        targetConfigSet.map((c) => c.typePlaceIndex),
        rankedTypeBoosts,
      );
      targetTypeVector = getTargetTypeVector({
        targetPowers,
        targetConfigSet,
        targetTypeIndices,
        rankedTypeBoosts,
        typeVector: currentTypeVector,
        forceDiff: true,
      });
      deltaTypeVector = diff(targetTypeVector, currentTypeVector);
      deltaTypeNorm = norm(deltaTypeVector);
      // Would change this to recursion but this needs to be forced somehow
      typeScoreWeight = 1;
    }

    let bestScore = -Infinity;
    let bestMealPowerProduct = -Infinity;
    let bestTypeProduct = -Infinity;
    let bestLevelProduct = -Infinity;

    const ingredientMapper = (ing: Ingredient): ScoredIngredient => {
      if (
        (remainingFillings <= 0 && ing.ingredientType === 'filling') ||
        (remainingCondiments <= 0 && ing.ingredientType === 'condiment') ||
        (!allowHerbaMystica && ing.isHerbaMystica) ||
        skipIngredients[ing.name]
      ) {
        return { ing, score: -Infinity };
      }

      const relativeTasteVector = getRelativeTasteVector({
        currentFlavorVector,
        ingredientFlavorVector: ing.flavorVector,
      });

      const relevantTaste = relativeTasteVector.map((c, mp) =>
        targetPowers.some((tp) => tp.mealPower === mp) || c < 0 ? c : 0,
      );
      const boostedMealPowerVector = add(
        ing.baseMealPowerVector,
        relevantTaste,
      );

      const positiveBoostedMpNorm = norm(
        boostedMealPowerVector.map((c) => (c > 0 ? c : 0)),
      );
      const n1 = deltaMpNorm * Math.sqrt(positiveBoostedMpNorm); // unsqrt?
      const mealPowerProduct =
        checkMealPower && n1 !== 0
          ? innerProduct(boostedMealPowerVector, deltaMealPowerVector) / n1
          : 0;

      const adjustedIngTypeVector = capTypeProducts
        ? scale(
            ing.typeVector,
            Math.min(1, deltaTypeNorm / norm(ing.typeVector)),
          )
        : ing.typeVector;
      const positiveTypeNorm = norm(
        adjustedIngTypeVector.map((c) => (c > 0 ? c : 0)),
      );
      const n2 = positiveTypeNorm * deltaTypeNorm;
      const typeProduct =
        checkType && n2 !== 0
          ? innerProduct(adjustedIngTypeVector, deltaTypeVector) / n2
          : 0;

      const adjustedIngLevelVector = capLevelProducts
        ? scale(
            ing.typeVector,
            Math.min(1, deltaLevelNorm / norm(ing.typeVector)),
          )
        : ing.typeVector;
      const n3 = deltaLevelNorm;
      const levelProduct =
        n3 !== 0
          ? innerProduct(adjustedIngLevelVector, deltaLevelVector) / n3
          : 0;
      const score =
        (mealPowerProduct * mealPowerScoreWeight +
          typeProduct * typeScoreWeight +
          levelProduct * levelScoreWeight) *
        (1 +
          (ing.ingredientType === 'condiment' && !ing.isHerbaMystica
            ? condimentBonus
            : 0));

      if (
        debug &&
        (ing.name === 'Watercress' || ing.name === 'Herbed Sausage')
      ) {
        console.debug(
          `${ing.name}: ${score}
      Raw scores: ${mealPowerProduct}, ${typeProduct}, ${levelProduct}
      Relative taste vector: ${relativeTasteVector}
      Boosted meal power vector: ${boostedMealPowerVector}
        n1: ${deltaMpNorm} * ${Math.sqrt(positiveBoostedMpNorm)} = ${n1}
      Type vector: ${ing.typeVector}
        n2: ${deltaTypeNorm} * ${Math.sqrt(positiveTypeNorm)} = ${n2}
      `,
        );
      }

      if (score > bestScore) {
        bestScore = score;
        bestMealPowerProduct = mealPowerProduct;
        bestTypeProduct = typeProduct;
        bestLevelProduct = levelProduct;
      }
      return {
        ing,
        score,
      };
    };

    const scoredIngredients = ingredients.map(ingredientMapper);
    scoredIngredients.sort((a, b) => b.score - a.score);

    const minScore =
      bestScore - INGREDIENT_SCORE_THRESHOLD * Math.abs(bestScore);
    const candidateScoredIngredients = scoredIngredients.filter(
      ({ ing, score }) => ing && score >= minScore,
    );

    // TODO: any herba mystica
    if (debug) {
      console.debug(`
      Selecting top ${MAX_CANDIDATES} candidates from:${[
        '',
        ...candidateScoredIngredients.map(
          ({ ing, score }) => `${ing?.name}: ${score}`,
        ),
      ].join(`
        `)}
      Target config set:${['', ...targetConfigSet.map((c) => JSON.stringify(c))]
        .join(`
      `)}
      Weights: ${mealPowerScoreWeight}, ${typeScoreWeight}, ${levelScoreWeight}
      Cap level products: ${capLevelProducts}
      Raw score components of ${
        candidateScoredIngredients[0]?.ing?.name
      }: ${bestMealPowerProduct}, ${bestTypeProduct}, ${bestLevelProduct}
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
    }

    const leastPassingScore =
      candidateScoredIngredients[MAX_CANDIDATES - 1]?.score ?? 0;

    return candidateScoredIngredients.filter(
      ({ score }) => score >= leastPassingScore,
    );
  };

  const scoredIngredients = targets.reduce<ScoredIngredient[]>(
    (selectedIngredients, target) => {
      const candidateIngredients = selectCandidatesForTarget(target);

      const combinedIngredients = [
        ...selectedIngredients,
        ...candidateIngredients.filter(
          (scored) =>
            scored.ing &&
            !selectedIngredients.some(
              (selected) => selected.ing.name === scored.ing.name,
            ),
        ),
      ];
      combinedIngredients.sort((a, b) => b.score - a.score);
      const leastPassingScore =
        combinedIngredients[MAX_CANDIDATES - 1]?.score ?? 0;

      return combinedIngredients.filter(
        ({ score }) => score >= leastPassingScore,
      );
    },
    [],
  );

  if (debug) {
    console.debug(
      `Final selection: ${scoredIngredients
        .map((si) => si.ing.name)
        .join(', ')}`,
    );
  }

  return scoredIngredients.map((si) => si.ing);
};
