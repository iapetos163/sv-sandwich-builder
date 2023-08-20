//@ts-expect-error
import type { Constraint, Model } from 'yalps';
import { linearVariables as lv } from '@/data';
import { Flavor, rangeFlavors } from '@/enum';

type ModelParams = {
  flavorProfile?: [Flavor, Flavor];
  multiplayer: boolean;
};

export const getModel = ({
  flavorProfile,
  multiplayer,
}: ModelParams): Model => {
  const piecesConstraints = multiplayer
    ? lv.constraints.multiplayerPieces
    : lv.constraints.singlePlayerPieces;

  const flavorConstraints: Record<string, Constraint> = {};
  const flavorVariables: Record<
    string,
    Record<string, number | undefined>
  > = {};
  if (flavorProfile) {
    const [firstFlavor, secondFlavor] = flavorProfile;
    const firstDiffVar = `F${firstFlavor}-F${secondFlavor}`;
    flavorVariables[firstDiffVar] =
      lv.variableSets.flavorValueDifferences[firstFlavor][secondFlavor];
    flavorConstraints[firstDiffVar] = {
      min: firstFlavor > secondFlavor ? 0 : 1,
    };

    rangeFlavors.forEach((flavor) => {
      if (flavor === firstFlavor || flavor === secondFlavor) return;
      const varName = `F${secondFlavor}-F${flavor}`;
      flavorVariables[varName] =
        lv.variableSets.flavorValueDifferences[secondFlavor][flavor];
      flavorConstraints[varName] = { min: secondFlavor > flavor ? 0 : 1 };
    });
  }

  return {
    direction: 'minimize',
    objective: 'score',
    constraints: {
      herba: { max: 2 },
      fillings: { max: multiplayer ? 12 : 6 },
      condiments: { max: multiplayer ? 8 : 4 },
      ...piecesConstraints,
      ...flavorConstraints,
    },
    variables: {
      ...lv.variables,
      ...flavorVariables,
    },
    integers: true,
  };
};
