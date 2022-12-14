import { ReactElement, useState } from 'react';
import styled from 'styled-components';
import PowerSelector from './component/PowerSelector';
import { allTypes, mealPowers } from './powers';

const allowedMealPowers = mealPowers.reduce<Record<string, true>>(
  (allowed, p) => ({ [p]: true, ...allowed }),
  {},
);

const allowedTypes = allTypes.reduce<Record<string, true>>(
  (allowed, m) => ({ [m]: true, ...allowed }),
  {},
);

function App(): ReactElement {
  return (
    <StyledContainer>
      <main>
        <form>
          <PowerSelector
            onRemove={() => {}}
            onSetPower={() => {}}
            allowedMealPowers={allowedMealPowers}
            allowedTypes={allowedTypes}
          />
          <PowerSelector
            onRemove={() => {}}
            onSetPower={() => {}}
            allowedMealPowers={allowedMealPowers}
            allowedTypes={allowedTypes}
            removable
          />
          <PowerSelector
            onRemove={() => {}}
            onSetPower={() => {}}
            allowedMealPowers={allowedMealPowers}
            allowedTypes={allowedTypes}
            removable
          />
        </form>
      </main>
    </StyledContainer>
  );
}

const StyledContainer = styled.div`
  margin: 20px;
  display: flex;
  justify-content: center;
`;

export default App;
