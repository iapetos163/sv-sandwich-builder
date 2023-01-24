import { meals } from '../data';
import { Meal, Power } from '../types';
import { powerSetsMatch } from './powers';

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
