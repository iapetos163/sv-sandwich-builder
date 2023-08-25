import { mealPowerCopy } from '../../strings';
import { Target } from './target';

const flavorCopy = ['SWEET', 'SOUR', 'SALTY', 'BITTER', 'SPICY'];

export const targetToStr = (t: Target) =>
  `${t.typeAllocation}
Boost ${
    t.boostPower !== null
      ? `${mealPowerCopy[t.boostPower]} (${flavorCopy[t.flavorProfile![0]]} + ${
          flavorCopy[t.flavorProfile![1]]
        })`
      : 'none'
  }
${t.numHerbaMystica} Herba Mystica`;
