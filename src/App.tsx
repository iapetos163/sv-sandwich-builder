import { ReactElement, useState } from 'react';
import styled from 'styled-components';
import PowerSelector from './component/PowerSelector';
import {
  makeSandwichForPower,
  Power,
  powersEqual,
  Sandwich,
} from './mechanics';
import { allTypes, mealPowers } from './strings';

const allowedMealPowers = mealPowers.reduce<Record<string, true>>(
  (allowed, p) => ({ [p]: true, ...allowed }),
  {},
);

const allowedTypes = allTypes.reduce<Record<string, true>>(
  (allowed, m) => ({ [m]: true, ...allowed }),
  {},
);

function App(): ReactElement {
  const [resultSandwich, setResultSandwich] = useState<Sandwich | null>(null);
  const [queryPower, setQueryPower] = useState<Power | null>(null);
  const handleSetPower = (power: Power) => {
    let samePower = false;
    setQueryPower((prev) => {
      if (prev && powersEqual(power, prev)) {
        samePower = true;
      }
      return power;
    });
    if (!samePower) {
      const sandwich = makeSandwichForPower(power);
      setResultSandwich(sandwich);
    }
  };

  return (
    <StyledContainer>
      <main>
        <form>
          <PowerSelector
            onRemove={() => {}}
            onSetPower={() => {}}
            allowedMealPowers={allowedMealPowers}
            allowedTypes={allowedTypes}
            maxLevel={3}
          />
          {/* <PowerSelector
            onRemove={() => {}}
            onSetPower={() => {}}
            allowedMealPowers={allowedMealPowers}
            allowedTypes={allowedTypes}
            maxLevel={3}
            removable
          />
          <PowerSelector
            onRemove={() => {}}
            onSetPower={() => {}}
            allowedMealPowers={allowedMealPowers}
            allowedTypes={allowedTypes}
            maxLevel={3}
            removable
          /> */}
        </form>
        {queryPower && !resultSandwich && (
          <>Could not create a sandwich with the requested power.</>
        )}
        {resultSandwich && 'sandwich here'}
      </main>
    </StyledContainer>
  );
}

const StyledContainer = styled.div`
  margin: 20px;
  display: flex;
  justify-content: center;

  > main {
    width: 600px;
  }
`;

export default App;
