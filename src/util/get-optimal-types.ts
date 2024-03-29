import {
  Flavor,
  MealPower,
  TypeIndex,
  rangeFlavors,
  rangeMealPowers,
  rangeTypes,
} from '@/enum';
import { Constraint, Model, solve } from '@/lp';
import {
  getFlavorProfilesForPower,
  isHerbaMealPower,
  rankTypeBoosts,
} from '@/mechanics';
import { getFlavorKey } from '@/strings';
import { Ingredient, LinearConstraints } from '@/types';
import { add, scale } from '@/vector-math';

type MpTarget = {
  mealPowersByPlace: [MealPower, MealPower | null];
  flavorProfile: [Flavor, Flavor];
};

type Entry = [string, [TypeIndex, TypeIndex]];

export const getOptimalTypes = async (
  lc: LinearConstraints,
  ingredients: Ingredient[],
) => {
  const getModel = ({ mealPowersByPlace, flavorProfile }: MpTarget): Model => {
    const constraints: Constraint[] = [];

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

    const [firstMp, secondMp] = mealPowersByPlace;

    const lastMp = secondMp ?? firstMp;

    const boostPower = firstMp;
    const setMpDiffConstraint = (greater: MealPower, lesser: MealPower) => {
      const boostOffset =
        greater === boostPower ? -100 : lesser === boostPower ? 100 : 0;

      const baseConstraint =
        lc.constraintSets.mealPowerValueDifferences[greater][lesser];
      constraints.push({
        name: baseConstraint.name,
        coefficients: baseConstraint.coefficients,
        lowerBound: baseConstraint.lowerBound! + boostOffset,
      });
    };

    if (secondMp !== null) {
      setMpDiffConstraint(firstMp!, secondMp);
    }

    rangeMealPowers
      .filter(
        (mp) =>
          !isHerbaMealPower(mp) &&
          mp !== firstMp &&
          mp !== secondMp &&
          mp !== lastMp,
      )
      .forEach((mp) => setMpDiffConstraint(lastMp, mp));

    return {
      objective: lc.objective,
      constraints: [
        {
          equals: 0,
          coefficients: lc.coefficientSets.herba,
        },
        {
          coefficients: lc.coefficientSets.fillingsTimes12,
          upperBound: 72,
          lowerBound: 12,
        },
        {
          coefficients: lc.coefficientSets.condiments,
          upperBound: 4,
          lowerBound: 1,
        },
        {
          // somewhat arbitrary constraint to ensure a lot of ingredients are picked
          name: 'Sum(T) >= 180',
          coefficients: Object.fromEntries(
            ingredients
              .map(({ id, typeVector }) => [
                id,
                rangeTypes.reduce((sum, t) => sum + typeVector[t], 0),
              ])
              .filter(([, v]) => v !== 0),
          ),
          lowerBound: 180,
        },
        ...lc.constraintSets.singlePlayerPieces,
        ...constraints,
      ],
    };
  };

  const getEntry = async (target: MpTarget): Promise<Entry> => {
    const model = getModel(target);
    const solution = await solve(model);

    let typeBoosts: number[] = [];
    Object.entries(solution.variables).forEach(([id, count]) => {
      const ingredient = ingredients.find((i) => i.id === id);
      if (!ingredient) return;
      typeBoosts = add(typeBoosts, scale(ingredient.typeVector, count));
    });
    const rankedTypeBoosts = rankTypeBoosts(typeBoosts);

    return [
      getFlavorKey(target.flavorProfile, target.mealPowersByPlace),
      [rankedTypeBoosts[0].type, rankedTypeBoosts[1].type],
    ];
  };

  return Object.fromEntries(
    (
      await Promise.all(
        rangeMealPowers.map(async (mp1) => {
          const flavorProfiles = getFlavorProfilesForPower(mp1);
          return (
            await Promise.all(
              flavorProfiles.map((fp) =>
                Promise.all(
                  [...rangeMealPowers.filter((mp) => mp !== mp1), null].map(
                    (mp2) =>
                      getEntry({
                        mealPowersByPlace: [mp1, mp2],
                        flavorProfile: fp,
                      }),
                  ),
                ),
              ),
            )
          ).flatMap((a) => a);
        }),
      )
    ).flatMap((a) => a),
  );
};
