import { FormEvent, ReactElement, useCallback, useState } from 'react';
import styled from 'styled-components';
import PowerSelector from './component/PowerSelector';
import SandwichResult from './component/SandwichResult';
import { rangeMealPowers, rangeTypes } from './enum';
import { makeSandwichForPower } from './mechanics';
import { Power, Sandwich } from './types';

const allowedMealPowers = rangeMealPowers.map(() => true);

const allowedTypes = rangeTypes.map(() => true);

function App(): ReactElement {
  const [resultSandwich, setResultSandwich] = useState<Sandwich | null>(null);
  const [queryPower, setQueryPower] = useState<Power | null>(null);
  const [queryChanged, setQueryChanged] = useState(true);
  const [calculating, setCalculating] = useState(false);

  const handleSetPower = useCallback((power: Power | null) => {
    setQueryPower(power);
    setQueryChanged(true);
  }, []);

  const handleSubmit = useCallback(
    (evt: FormEvent) => {
      evt.preventDefault();
      if (calculating || !queryPower) return;
      setCalculating(true);
      setTimeout(() => {
        const sandwich = makeSandwichForPower(queryPower);
        setResultSandwich(sandwich);
        setQueryChanged(false);
        setCalculating(false);
      }, 10);
    },
    [calculating, queryPower],
  );

  return (
    <StyledContainer>
      <main>
        <form onSubmit={handleSubmit}>
          <PowerSelector
            onRemove={() => {}}
            onChange={handleSetPower}
            allowedMealPowers={allowedMealPowers}
            allowedTypes={allowedTypes}
            maxLevel={3}
          />
          {/* <PowerSelector
            onRemove={() => {}}
            onChange={() => {}}
            allowedMealPowers={allowedMealPowers}
            allowedTypes={allowedTypes}
            maxLevel={3}
            removable
          />
          <PowerSelector
            onRemove={() => {}}
            onChange={() => {}}
            allowedMealPowers={allowedMealPowers}
            allowedTypes={allowedTypes}
            maxLevel={3}
            removable
          /> */}
          <button type="submit" disabled={!queryPower}>
            Submit
          </button>
        </form>
        {calculating && <>Calculating...</>}
        {!calculating && !queryChanged && !resultSandwich && (
          <>Could not create a sandwich with the requested power.</>
        )}
        {!calculating && resultSandwich && (
          <SandwichResult sandwich={resultSandwich} />
        )}
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
