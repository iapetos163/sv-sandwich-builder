import { FormEvent, ReactElement, useCallback, useState } from 'react';
import styled from 'styled-components';
import PowerSelector from './component/PowerSelector';
import SandwichResult from './component/SandwichResult';
import { makeSandwichForPower } from './mechanics';
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
  const [queryChanged, setQueryChanged] = useState(true);

  const handleSetPower = useCallback((power: Power) => {
    setQueryPower(power);
    setQueryChanged(true);
  }, []);

  const handleSubmit = useCallback(
    (evt: FormEvent) => {
      evt.preventDefault();
      if (!queryPower) return;
      const sandwich = makeSandwichForPower(queryPower);
      setResultSandwich(sandwich);
      setQueryChanged(false);
    },
    [queryPower],
  );

  return (
    <StyledContainer>
      <main>
        <form onSubmit={handleSubmit}>
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
          <button type="submit">Submit</button>
        </form>
        {!queryChanged && !resultSandwich && (
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
