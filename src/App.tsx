import { ReactElement, useCallback, useState } from 'react';
import styled from 'styled-components';
import PowerSelector from './component/PowerSelector';
import SandwichResult from './component/SandwichResult';
import { makeSandwichForPower, powersEqual } from './mechanics';
import { allTypes, mealPowers } from './strings';
import { Power, Sandwich } from './types';

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
  const handleSetPower = useCallback((power: Power) => {
    setQueryPower((prev) => {
      if (!prev || !powersEqual(power, prev)) {
        const sandwich = makeSandwichForPower(power);
        setResultSandwich(sandwich);
      }

      return power;
    });
  }, []);

  return (
    <StyledContainer>
      <main>
        <form>
          <PowerSelector
            onRemove={() => {}}
            onSetPower={handleSetPower}
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
        {resultSandwich && <SandwichResult sandwich={resultSandwich} />}
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
