import { MapPin } from 'react-feather';
import styled from 'styled-components';
import { mealPowerHasType } from '../mechanics';
import { allTypes, mealPowerCopy } from '../strings';
import { Meal } from '../types';
import RecipeList from './RecipeList';

const StyledContainer = styled.div``;

const StyledRecipeList = styled(RecipeList)`
  margin-bottom: 30px;
`;

export interface MealResultProps {
  meal: Meal;
  className?: string;
}

const MealResult = ({ meal, className }: MealResultProps) => {
  const { shop, towns, powers } = meal;

  // TODO: name, number, image
  return (
    <StyledContainer className={className}>
      <div>
        <MapPin /> {shop}
        {towns.map((town) => (
          <div key={town}>{town}</div>
        ))}
      </div>
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
export default MealResult;
