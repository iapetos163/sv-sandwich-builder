import { linearConstraints as lc } from '@/data';
import { MealPower, rangeFlavors, rangeMealPowers, rangeTypes } from '@/enum';
import type { Constraint, Model } from '@/lp';
import { isHerbaMealPower } from '@/mechanics';
import { Target } from './target';

type ModelParams = {
  target: Target;
  multiplayer: boolean;
};

// TODO: modify data format to work better for this model type
export const getModel = ({
  target: {
    powers,
    configSet,
    flavorProfile,
    numHerbaMystica,
    boostPower,
    typesByPlace,
    firstTypeGte,
    firstTypeLte,
    thirdTypeGte,
  },
  multiplayer,
}: ModelParams): Model => {
  const piecesConstraints = multiplayer
    ? lc.constraintSets.multiplayerPieces
    : lc.constraintSets.singlePlayerPieces;

  const constraints: Constraint[] = [];

  if (flavorProfile) {
    const [firstFlavor, secondFlavor] = flavorProfile;
    constraints.push(
      lc.constraintSets.flavorValueDifferences[firstFlavor][secondFlavor],
    );

    rangeFlavors.forEach((flavor) => {
      if (flavor === firstFlavor || flavor === secondFlavor) return;
      constraints.push(
        lc.constraintSets.flavorValueDifferences[secondFlavor][flavor],
      );
    });
  }

  const requestedHerbaPower = powers.find((p) => isHerbaMealPower(p.mealPower));
  if (requestedHerbaPower) {
    constraints.push(lc.constraints.herbaMealPowerValue);
  }
  const baseMpPlaceIndex = numHerbaMystica > 0 ? 2 : 0;
  const firstMp =
    powers[configSet.findIndex((c) => c.mpPlaceIndex === baseMpPlaceIndex)]
      ?.mealPower;

  const secondMp =
    powers[configSet.findIndex((c) => c.mpPlaceIndex === baseMpPlaceIndex + 1)]
      ?.mealPower;

  const thirdMp =
    powers[configSet.findIndex((c) => c.mpPlaceIndex === baseMpPlaceIndex + 2)]
      ?.mealPower;

  const lastMp = thirdMp ?? secondMp ?? firstMp;

  const setMpDiffConstraint = (greater: MealPower, lesser: MealPower) => {
    const boostOffset =
      greater === boostPower ? -100 : lesser === boostPower ? 100 : 0;

    const baseConstraint =
      lc.constraintSets.mealPowerValueDifferences[greater][lesser];
    constraints.push({
      coefficients: baseConstraint.coefficients,
      lowerBound: baseConstraint.lowerBound! + boostOffset,
    });
  };

  if (firstMp !== undefined && secondMp !== undefined) {
    setMpDiffConstraint(firstMp, secondMp);
  }

  if (secondMp !== undefined && thirdMp !== undefined) {
    setMpDiffConstraint(secondMp, thirdMp);
  }

  if (lastMp !== undefined) {
    rangeMealPowers
      .filter(
        (mp) =>
          !isHerbaMealPower(mp) &&
          mp !== firstMp &&
          mp !== secondMp &&
          mp !== lastMp,
      )
      .forEach((mp) => setMpDiffConstraint(lastMp, mp));
  }

  const [firstType, secondType, thirdType] = typesByPlace;
  const lastType = thirdType ?? secondType ?? firstType;

  if (secondType !== undefined) {
    const constraint =
      lc.constraintSets.typeValueDifferences[firstType][secondType];
    constraints.push(constraint);
  }
  if (secondType !== undefined && thirdType !== undefined) {
    const constraint =
      lc.constraintSets.typeValueDifferences[secondType][thirdType];
    constraints.push(constraint);
  }

  rangeTypes.forEach((typeIndex) => {
    if (
      typeIndex === firstType ||
      typeIndex === secondType ||
      typeIndex === lastType
    )
      return;

    const constraint =
      lc.constraintSets.typeValueDifferences[lastType][typeIndex];
    constraints.push(constraint);
  });

  if (firstTypeGte > 0 && firstTypeLte < Infinity) {
    constraints.push({
      upperBound: firstTypeLte,
      lowerBound: firstTypeGte,
      coefficients: lc.coefficientSets.typeValues[firstType],
    });
  } else if (firstTypeLte < Infinity) {
    constraints.push({
      upperBound: firstTypeLte,
      coefficients: lc.coefficientSets.typeValues[firstType],
    });
  } else if (firstTypeGte > 0) {
    constraints.push({
      lowerBound: firstTypeGte,
      coefficients: lc.coefficientSets.typeValues[firstType],
    });
  }

  // FIXME? what if thirdType === undefined && thirdTypeGte > 0
  if (thirdType !== undefined && thirdTypeGte > 0) {
    constraints.push({
      lowerBound: thirdTypeGte,
      coefficients: lc.coefficientSets.typeValues[thirdType],
    });
  }

  return {
    objective: lc.objective,
    constraints: [
      {
        equals: numHerbaMystica,
        coefficients: lc.coefficientSets.herba,
      },
      {
        coefficients: lc.coefficientSets.fillings,
        upperBound: multiplayer ? 12 : 6,
        lowerBound: 1,
      },
      {
        coefficients: lc.coefficientSets.condiments,
        upperBound: multiplayer ? 8 : 4,
        lowerBound: 1,
      },
      ...piecesConstraints,
      ...constraints,
    ],
  };
};
