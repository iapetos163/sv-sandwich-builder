import { allTypes, mealPowerCopy } from '../../strings';
import { Target, TargetConfig } from './target';

export const configSetToStr = (configs: TargetConfig[]) =>
  `${configs[0].typeAllocation}
mpPlaceIndices: ${configs.map((c) => c.mpPlaceIndex)}
typePlaceIndices: ${configs.map((c) => c.typePlaceIndex)}`;

export const targetToStr = (t: Target) =>
  `${configSetToStr(t.configSet)}
Boost ${t.boostPower !== null ? mealPowerCopy[t.boostPower] : 'none'}`;
