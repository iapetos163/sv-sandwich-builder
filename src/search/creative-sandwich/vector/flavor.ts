import { Flavor, rangeFlavors } from '../../../enum';
import { FlavorBoost } from '../../../mechanics/index';

export interface GetTargetFlavorVectorProps {
  flavorVector: number[];
  rankedFlavorBoosts: FlavorBoost[];
  flavorProfile: [Flavor, Flavor];
}

export const getTargetFlavorVector = ({
  flavorVector,
  flavorProfile,
  rankedFlavorBoosts,
}: GetTargetFlavorVectorProps) => {
  const [primaryFlavor, secondaryFlavor] = flavorProfile;

  let primaryTarget: number, secondaryTarget: number;
  if (rankedFlavorBoosts[0]?.flavor === primaryFlavor) {
    secondaryTarget =
      rankedFlavorBoosts[1]?.flavor === secondaryFlavor
        ? rankedFlavorBoosts[1].amount
        : (rankedFlavorBoosts[1]?.amount ?? 0) + 1;
    primaryTarget = Math.max(rankedFlavorBoosts[0].amount, secondaryTarget);
  } else {
    secondaryTarget =
      rankedFlavorBoosts[0]?.flavor === secondaryFlavor
        ? rankedFlavorBoosts[0].amount
        : (rankedFlavorBoosts[0]?.amount ?? 0) + 1;

    primaryTarget =
      primaryFlavor < secondaryFlavor ? secondaryTarget : secondaryTarget + 1;
  }

  return rangeFlavors.map((f) =>
    f === primaryFlavor
      ? primaryTarget
      : f === secondaryFlavor
      ? secondaryTarget
      : flavorVector[f] ?? 0,
  );
};
