// import { MealPowerBoost } from '../../../mechanics/powers';
// import { createMetaVector } from '../../../metavector';
// import { Power } from '../../../types';
// import { TargetConfig } from '../target';
// import { getTargetMealPowerVector } from './meal-power';

export { getTargetTypeVector } from './type-vector';
export { getRelativeTasteVector } from './taste';
export { boostMealPowerVector, getTargetMealPowerVector } from './meal-power';

export type { GetTargetTypeVectorProps } from './type-vector';
export type { RelativeTasteVectorProps } from './taste';
export type { GetTargetMealPowerVectorProps } from './meal-power';

// export interface GetTargetMetaVectorProps {
//   targetPowers: Power[];
//   targetConfigSet: TargetConfig[];
//   rankedMealPowerBoosts: MealPowerBoost[];
// }

// export const getTargetMetaVector = ({
//   targetPowers,
//   targetConfigSet,
//   rankedMealPowerBoosts,
// }: GetTargetMetaVectorProps) => {
//   return createMetaVector({
//     mealPowerVector: getTargetMealPowerVector({
//       targetPowers,
//       targetConfigSet,
//       rankedMealPowerBoosts,
//     }),
//   });
// };
