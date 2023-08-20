//@ts-expect-error
import type { Constraint, Model } from 'yalps';
import { linearVariables as lv } from '@/data';
import { rangeFlavors } from '@/enum';
import { isHerbaMealPower } from '@/mechanics';
import { Target } from './target';

type ModelParams = {
  target: Target;
  multiplayer: boolean;
};

export const getModel = ({
  target: { powers, configSet, flavorProfile, numHerbaMystica, boostPower },
  multiplayer,
}: ModelParams): Model => {
  const piecesConstraints = multiplayer
    ? lv.constraints.multiplayerPieces
    : lv.constraints.singlePlayerPieces;

  const flavorConstraints: Record<string, Constraint> = {};
  const flavorVars: Record<string, Record<string, number | undefined>> = {};
  if (flavorProfile) {
    const [firstFlavor, secondFlavor] = flavorProfile;
    const firstDiffVar = `F${firstFlavor}-F${secondFlavor}`;
    flavorVars[firstDiffVar] =
      lv.variableSets.flavorValueDifferences[firstFlavor][secondFlavor];
    flavorConstraints[firstDiffVar] = {
      min: firstFlavor > secondFlavor ? 0 : 1,
    };

    rangeFlavors.forEach((flavor) => {
      if (flavor === firstFlavor || flavor === secondFlavor) return;
      const varName = `F${secondFlavor}-F${flavor}`;
      flavorVars[varName] =
        lv.variableSets.flavorValueDifferences[secondFlavor][flavor];
      flavorConstraints[varName] = { min: secondFlavor > flavor ? 0 : 1 };
    });
  }

  const mpConstraints: Record<string, Constraint> = {};
  const mpVariables: Record<string, Record<string, number | undefined>> = {};
  const requestedHerbaPower = powers.find((p) => isHerbaMealPower(p.mealPower));
  if (requestedHerbaPower) {
    const varName = `MP${requestedHerbaPower.mealPower}`;
    mpVariables[varName] = {}; // TODO
    mpConstraints[varName] = { min: 1 };
  }
  if (boostPower) {
    const baseMpPlaceIndex = numHerbaMystica > 0 ? 2 : 0;
    const firstMp =
      powers[configSet.findIndex((c) => c.mpPlaceIndex === baseMpPlaceIndex)]
        ?.mealPower;

    const secondMp =
      powers[
        configSet.findIndex((c) => c.mpPlaceIndex === baseMpPlaceIndex + 1)
      ]?.mealPower;

    const thirdMp =
      powers[
        configSet.findIndex((c) => c.mpPlaceIndex === baseMpPlaceIndex + 2)
      ]?.mealPower;

    // TODO: do something with these
  }

  return {
    direction: 'minimize',
    objective: 'score',
    constraints: {
      herba: { equal: numHerbaMystica },
      fillings: { max: multiplayer ? 12 : 6 },
      condiments: { max: multiplayer ? 8 : 4 },
      ...piecesConstraints,
      ...flavorConstraints,
    },
    variables: {
      ...lv.variables,
      ...flavorVars,
    },
    integers: true,
  };
};
