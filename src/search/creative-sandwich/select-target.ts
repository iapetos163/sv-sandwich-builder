import { TargetConfig } from './target';

export interface Target {
  configSet: TargetConfig[];
  transformedTargetMetaVector: number[];
}

export interface SelectTargetsProps {
  mealPowerVector: number[];
  typeVector: number[];
  flavorVector: number[];
  /** @default true */
  avoidHerbaMystica?: boolean;
  remainingFillings: number;
  remainingCondiments: number;
}

const CONDIMENT_SCORE = 1;
const FILLING_SCORE = 5;
const DEFAULT_HERBA_SCORE = 35;

export const selectTargets = ({
  mealPowerVector,
  typeVector,
  flavorVector,
  remainingCondiments,
  remainingFillings,
  avoidHerbaMystica = true,
}: SelectTargetsProps): Target[] => {
  const HERBA_SCORE = avoidHerbaMystica ? DEFAULT_HERBA_SCORE : CONDIMENT_SCORE;
};
