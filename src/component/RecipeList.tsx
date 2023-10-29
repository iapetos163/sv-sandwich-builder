import classNames from 'classnames';
import { useMemo } from 'react';
import { ingredientNamesById, ingredients } from '@/data';
import { Ingredient } from '@/types';
import s from './RecipeList.module.css';

const ingredientIds = ingredients.map((i) => i.id);
const sortIngredientCounts = (counts: Record<string, number>) =>
  Object.entries(counts)
    .map(([id, count]) => {
      const index = ingredientIds.indexOf(id);
      return {
        id,
        name: ingredientNamesById[id],
        count,
        index,
        imagePath: ingredients[index].imagePath,
      };
    })
    .sort((a, b) => a.index - b.index);

const ingredientCountReducer = (
  agg: Record<string, number>,
  ing: Ingredient,
) => {
  return {
    ...agg,
    [ing.id]: (agg[ing.id] || 0) + 1,
  };
};

interface RecipeListProps {
  fillings: Ingredient[];
  condiments: Ingredient[];
  optionalPieceDrops?: Record<string, number>;
  requiredPieceDrops?: Record<string, number>;
  className?: string;
}

const piecesCopy = (numPieces: number) =>
  `${numPieces} piece${numPieces > 1 ? 's' : ''}`;

const RecipeList = ({
  fillings,
  condiments,
  optionalPieceDrops = {},
  requiredPieceDrops = {},
  className,
}: RecipeListProps) => {
  const fillingCounts = useMemo(() => {
    const counts = fillings.reduce(ingredientCountReducer, {});
    return sortIngredientCounts(counts);
  }, [fillings]);

  const condimentCounts = useMemo(() => {
    const counts = condiments.reduce(ingredientCountReducer, {});
    return sortIngredientCounts(counts);
  }, [condiments]);

  return (
    <div className={className}>
      {fillingCounts.map(({ id, name, count, imagePath }) => (
        <div className={s.line} key={id}>
          <div className={s.count}>{count}x</div>
          <div>
            <img className={s.icon} src={`assets/${imagePath}`} />
          </div>
          <div>
            <div>{name}</div>
            {!!requiredPieceDrops[id] && (
              <div className={classNames(s.pieceDrops, s.required)}>
                MUST drop {piecesCopy(requiredPieceDrops[id])}
              </div>
            )}
            {!!optionalPieceDrops[id] && (
              <div className={s.pieceDrops}>
                OK to drop {piecesCopy(optionalPieceDrops[id])}
              </div>
            )}
          </div>
        </div>
      ))}
      {condimentCounts.map(({ id, name, count, imagePath }) => (
        <div className={s.line} key={id}>
          <div className={s.count}>{count}x</div>
          <div>
            <img className={s.icon} src={`assets/${imagePath}`} />
          </div>
          <div>{name}</div>
        </div>
      ))}
    </div>
  );
};

export default RecipeList;
