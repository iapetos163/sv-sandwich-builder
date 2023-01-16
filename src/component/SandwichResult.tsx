import { useMemo } from 'react';
import styled from 'styled-components';
import { ingredients } from '../data';
import { mealPowerHasType } from '../mechanics';
import { allTypes, mealPowerCopy } from '../strings';
import { Ingredient, Sandwich } from '../types';

const ingredientNames = ingredients.map((i) => i.name);
const sortIngredientCounts = (counts: Record<string, number>) =>
  Object.entries(counts)
    .map(([name, count]) => {
      const index = ingredientNames.indexOf(name);
      return { name, count, index, imagePath: ingredients[index].imagePath };
    })
    .sort((a, b) => a.index - b.index);

const StyledContainer = styled.div``;

const StyledRecipeList = styled.div`
  margin-bottom: 30px;
`;

interface RecipeProps {
  fillings: Ingredient[];
  condiments: Ingredient[];
}

const RecipeIcons = ({ fillings, condiments }: RecipeProps) => null;

const ingredientCountReducer = (
  agg: Record<string, number>,
  ing: Ingredient,
) => {
  return {
    ...agg,
    [ing.name]: (agg[ing.name] || 0) + 1,
  };
};

const RecipeList = ({ fillings, condiments }: RecipeProps) => {
  const fillingCounts = useMemo(() => {
    const counts = fillings.reduce(ingredientCountReducer, {});
    return sortIngredientCounts(counts);
  }, [fillings]);

  const condimentCounts = useMemo(() => {
    const counts = condiments.reduce(ingredientCountReducer, {});
    return sortIngredientCounts(counts);
  }, [condiments]);

  return (
    <StyledRecipeList>
      <h3>Fillings</h3>
      {fillingCounts.map(({ name, count, imagePath }) => (
        <div key={name}>
          {count}x <img src={`asset/${imagePath}`} /> {name}
        </div>
      ))}
      <h3>Condiments</h3>
      {condimentCounts.map(({ name, count, imagePath }) => (
        <div key={name}>
          {count}x <img src={`asset/${imagePath}`} /> {name}
        </div>
      ))}
    </StyledRecipeList>
  );
};

export interface SandwichResultProps {
  sandwich: Sandwich;
}

const SandwichResult = ({ sandwich }: SandwichResultProps) => {
  const { fillings, condiments, powers } = sandwich;

  return (
    <StyledContainer>
      <RecipeIcons fillings={fillings} condiments={condiments} />
      <RecipeList fillings={fillings} condiments={condiments} />
      <div>
        {powers.map((power) => (
          <div key={power.type + power.mealPower}>
            Lv. {power.level}{' '}
            {mealPowerHasType(power.mealPower) && `${allTypes[power.type]} `}
            {mealPowerCopy[power.mealPower]} Power
          </div>
        ))}
      </div>
    </StyledContainer>
  );
};
export default SandwichResult;
