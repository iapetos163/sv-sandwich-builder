import { allTypes, mealPowerCopy } from '../../strings';
import { Target } from './target';

export const targetToStr = (t: Target) =>
  `${t.configSet[0].typeAllocation}
mpPlaceIndices: ${t.configSet.map((c) => c.mpPlaceIndex)}
typePlaceIndices: ${t.configSet.map((c) => c.typePlaceIndex)}
Boost ${t.boostPower !== null ? mealPowerCopy[t.boostPower] : 'none'}`;
