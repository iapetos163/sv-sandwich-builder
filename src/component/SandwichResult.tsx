import styled from 'styled-components';
import { mealPowerHasType } from '../mechanics';
import { allTypes, mealPowerCopy } from '../strings';
import { Ingredient, Sandwich } from '../types';
import RecipeList from './RecipeList';

const StyledContainer = styled.div`
  text-align: left;
`;

const StyledRecipeList = styled(RecipeList)`
  margin-bottom: 30px;
`;

interface RecipeProps {
  fillings: Ingredient[];
  condiments: Ingredient[];
}

const RecipeIcons = ({ fillings, condiments }: RecipeProps) => null;

export interface SandwichResultProps {
  sandwich: Sandwich;
  className?: string;
}

const SandwichResult = ({ sandwich, className }: SandwichResultProps) => {
  const { fillings, condiments, powers } = sandwich;

  return (
    <StyledContainer className={className}>
      <RecipeIcons fillings={fillings} condiments={condiments} />
      <h3>Recipe</h3>
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
export default SandwichResult;
