import { ingredients } from '@/data';
//@ts-expect-error
import type { Model } from 'yalps';

const getPiecesConstraints = (limit: number) =>
  Object.fromEntries(
    ingredients
      .filter((i) => i.pieces > 2)
      .map((i) => [i.name, { max: Math.floor(limit / i.pieces) }]),
  );

const multiplayerPiecesConstraints = getPiecesConstraints(15);
const singlePlayerPiecesConstraints = getPiecesConstraints(12);

const variables = {
  fillings: Object.fromEntries(
    ingredients
      .filter((i) => i.ingredientType === 'filling')
      .map((i) => i.name)
      .map((n) => [n, 1]),
  ),
  condiments: Object.fromEntries(
    ingredients
      .filter((i) => i.ingredientType === 'condiment')
      .map((i) => i.name)
      .map((n) => [n, 1]),
  ),
  herba: Object.fromEntries(
    ingredients
      .filter((i) => i.isHerbaMystica)
      .map((i) => i.name)
      .map((n) => [n, 1]),
  ),
  score: Object.fromEntries(
    ingredients.map((ing) => [
      ing.name,
      ing.ingredientType === 'filling' ? 5 : ing.isHerbaMystica ? 35 : 1,
    ]),
  ),
};

type ModelParams = {
  multiplayer: boolean;
};

export const getModel = ({ multiplayer }: ModelParams): Model => ({
  direction: 'minimize',
  objective: 'score',
  constraints: {
    herba: { max: 2 },
    fillings: { max: multiplayer ? 12 : 6 },
    condiments: { max: multiplayer ? 8 : 4 },
    ...(multiplayer
      ? multiplayerPiecesConstraints
      : singlePlayerPiecesConstraints),
  },
  variables,
  integers: true,
});
