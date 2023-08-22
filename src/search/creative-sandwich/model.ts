import { linearVariables as lv } from '@/data';
import { MealPower, rangeFlavors, rangeMealPowers } from '@/enum';
import type { Constraint, Model } from '@/lp';
import { isHerbaMealPower } from '@/mechanics';
import { Target } from './target';

type ModelParams = {
  target: Target;
  multiplayer: boolean;
};

// TODO: modify data format to work better for this model type
export const getModel = ({
  target: { powers, configSet, flavorProfile, numHerbaMystica, boostPower },
  multiplayer,
}: ModelParams): Model => {
  const piecesConstraints = multiplayer
    ? lv.constraints.multiplayerPieces
    : lv.constraints.singlePlayerPieces;

  const constraints: Constraint[] = [];

  if (flavorProfile) {
    const [firstFlavor, secondFlavor] = flavorProfile;
    constraints.push({
      coefficients:
        lv.variableSets.flavorValueDifferences[firstFlavor][secondFlavor],
      lowerBound: firstFlavor > secondFlavor ? 0 : 1,
    });

    rangeFlavors.forEach((flavor) => {
      if (flavor === firstFlavor || flavor === secondFlavor) return;
      constraints.push({
        coefficients:
          lv.variableSets.flavorValueDifferences[secondFlavor][flavor],
        lowerBound: secondFlavor > flavor ? 0 : 1,
      });
    });
  }

  const requestedHerbaPower = powers.find((p) => isHerbaMealPower(p.mealPower));
  if (requestedHerbaPower) {
    constraints.push({
      coefficients: lv.variables.herbaMealPowerValue,
      lowerBound: 1,
    });
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

    constraints.push({
      coefficients: lv.variableSets.mealPowerValueDifferences[greater][lesser],
      lowerBound: (greater > lesser ? 0 : 1) + boostOffset,
    });
  };

  if (firstMp && secondMp) {
    setMpDiffConstraint(firstMp, secondMp);
  }

  if (secondMp && thirdMp) {
    setMpDiffConstraint(secondMp, thirdMp);
  }

  if (lastMp) {
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

  const { fillings, condiments, herba, score } = lv.variables;

  return {
    objective: {
      direction: 'min',
      coefficients: score,
    },
    constraints: [
      {
        lowerBound: numHerbaMystica,
        // TODO equal
        // upperBound: numHerbaMystica,
        coefficients: herba,
      },
      {
        upperBound: multiplayer ? 12 : 6,
        coefficients: fillings,
        lowerBound: 1,
      },
      {
        upperBound: multiplayer ? 8 : 4,
        coefficients: condiments,
        lowerBound: 1,
      },
      ...Object.entries(piecesConstraints).map(
        ([name, { max: upperBound }]) => ({
          coefficients: { [name]: 1 },
          upperBound,
        }),
      ),
      ...constraints,
    ],
  };
};
