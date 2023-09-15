import styled from 'styled-components';
import { mealPowerHasType } from '../mechanics';
import { allTypes, mealPowerCopy } from '../strings';
import { SandwichRecipe } from '../types';
import RecipeList from './RecipeList';

const StyledContainer = styled.div`
  text-align: left;
`;
const StyledFrameContainer = styled.div`
  display: flex;
  justify-content: center;
`;
const StyledFrame = styled.div`
  border: 2px solid var(--color-bright-green);
`;

const StyledImage = styled.img`
  display: block;
  max-height: 240px;
`;

const StyledRecipeList = styled(RecipeList)`
  margin-bottom: 30px;
`;

export interface RecipeResultProps {
  recipe: SandwichRecipe;
  className?: string;
}

const RecipeResult = ({ recipe, className }: RecipeResultProps) => {
  const { fillings, condiments, powers, imagePath, name } = recipe;

  // TODO: name, number, image
  return (
    <StyledContainer className={className}>
      <StyledFrameContainer>
        <StyledFrame>
          <StyledImage src={`assets/${imagePath}`} alt={name} />
        </StyledFrame>
      </StyledFrameContainer>
      <h3>Ingredients</h3>
      <StyledRecipeList fillings={fillings} condiments={condiments} />
      <h3>Meal Powers</h3>
      <div>
        {powers.map((power) => (
          <div key={`${power.type}${power.mealPower}`}>
            Lv. {power.level} {mealPowerCopy[power.mealPower]} Power
            {mealPowerHasType(power.mealPower) && `: ${allTypes[power.type]}`}
          </div>
        ))}
      </div>
    </StyledContainer>
  );
};
export default RecipeResult;
