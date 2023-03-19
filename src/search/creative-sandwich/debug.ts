import { allTypes, mealPowerCopy } from '../../strings';
import { Target, TargetConfig } from './target';

const flavorCopy = ['SWEET', 'SOUR', 'SALTY', 'BITTER', 'SPICY'];

export const configSetToStr = (configs: TargetConfig[]) =>
  `${configs[0].typeAllocation}
mpPlaceIndices: ${configs.map((c) => c.mpPlaceIndex)}
typePlaceIndices: ${configs.map((c) => c.typePlaceIndex)}`;

export const targetToStr = (t: Target) =>
  `${configSetToStr(t.configSet)}
Boost ${
    t.boostPower !== null
      ? `${mealPowerCopy[t.boostPower]} (${flavorCopy[t.flavorProfile![0]]} + ${
          flavorCopy[t.flavorProfile![1]]
        })`
      : 'none'
  }
${t.numHerbaMystica} Herba Mystica`;
