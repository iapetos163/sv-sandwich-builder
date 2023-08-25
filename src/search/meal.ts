import { meals } from '../data';
import { powerSetsMatch } from '../mechanics';
import { Meal, Power } from '../types';

export const getMealForPowers = (targetPowers: Power[]) => {
  const [optimalMeal] = meals.reduce<[Meal | null, number]>(
    ([optimal, lowestCost], meal) => {
      if (!powerSetsMatch(meal.powers, targetPowers)) {
        return [optimal, lowestCost];
      }

      if (meal.cost < lowestCost) {
        return [meal, meal.cost];
      }
      return [optimal, lowestCost];
    },
    [null, Infinity],
  );

  return optimalMeal;
};
