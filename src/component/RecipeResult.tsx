import styled from 'styled-components';
import { mealPowerHasType } from '../mechanics';
import { allTypes, mealPowerCopy } from '../strings';
import { SandwichRecipe } from '../types';
import RecipeList from './RecipeList';

const StyledContainer = styled.div``;

const StyledRecipeList = styled(RecipeList)`
  margin-bottom: 30px;
`;

export interface RecipeResultProps {
  recipe: SandwichRecipe;
  className?: string;
}

const RecipeResult = ({ recipe, className }: RecipeResultProps) => {
  const { fillings, condiments, powers } = recipe;

  // TODO: name, number, image
  return (
    <StyledContainer className={className}>
      <h3>Ingredients</h3>
      <StyledRecipeList fillings={fillings} condiments={condiments} />
      <h3>Meal Powers</h3>
      <div>
        {powers.map((power) => (
          <div key={power.type + power.mealPower}>
            Lv. {power.level} {mealPowerCopy[power.mealPower]} Power
            {mealPowerHasType(power.mealPower) && `: ${allTypes[power.type]}`}
          </div>
        ))}
      </div>
    </StyledContainer>
  );
};
export default RecipeResult;
