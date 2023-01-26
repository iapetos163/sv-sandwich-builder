import { MapPin } from 'react-feather';
import styled from 'styled-components';
import { mealPowerHasType } from '../mechanics';
import { allTypes, mealPowerCopy } from '../strings';
import { Meal } from '../types';

const StyledContainer = styled.div`
  text-align: left;
`;

const StyledSummary = styled.div`
  display: flex;
  align-items: center;
`;

const StyledFrameContainer = styled.div`
  flex: 1;
  padding: 5px;
  display: flex;
  justify-content: center;
`;

const StyledFrame = styled.div`
  background-color: #f3f1e0;
  border: 2px solid #bdf7ab;
  padding: 5px;
`;

const StyledLocationContainer = styled.div`
  display: flex;
  flex: 1;
  line-height: 1.3;
  > div {
    margin: 0 2px;
  }
`;

const StyledShopName = styled.div`
  font-weight: 600;
  line-height: 1.7;
`;

export interface MealResultProps {
  meal: Meal;
  className?: string;
}

const MealResult = ({ meal, className }: MealResultProps) => {
  const { shop, towns, powers, imagePath, name } = meal;

  return (
    <StyledContainer className={className}>
      <StyledSummary>
        <StyledFrameContainer>
          <StyledFrame>
            <img src={`assets/${imagePath}`} alt={name} />
          </StyledFrame>
        </StyledFrameContainer>

        <StyledLocationContainer>
          <div>
            <MapPin />
          </div>
          <div>
            <StyledShopName>{shop}</StyledShopName>
            {towns.map((town) => (
              <div key={town}>{town}</div>
            ))}
          </div>
        </StyledLocationContainer>
      </StyledSummary>
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
