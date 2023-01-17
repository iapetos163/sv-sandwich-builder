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
      <header>
        <h2>Pokémon Scarlet/Violet</h2>
        <h1>Sandwich Calculator</h1>
      </header>
      <main>
        <section>
          <StyledSectionHeader>
            <h2>About</h2>
          </StyledSectionHeader>
          <p>Lorem ipsum</p>
        </section>
        <section>
          <StyledSectionHeader>
            <h2>Query</h2>
          </StyledSectionHeader>
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
        </section>
        <section>
          <StyledSectionHeader>
            <h2>Results</h2>
          </StyledSectionHeader>
        </section>
        <section>
          <StyledSectionHeader>
            <h2>Links</h2>
          </StyledSectionHeader>
        </section>
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
  margin: 15px 10px;
  color: #1d261a;

  h1 {
    margin-top: 0;
  }

  > header {
    text-align: center;

    h2 {
      margin-bottom: 0;
    }
  }

  > main {
    width: 600px;
    h2 {
      color: #262517;
      font-size: 1em;
      font-style: italic;
    }
  }
`;

const StyledSectionHeader = styled.div`
  border-bottom: 2px solid #262517;
  height: 0.5em;

  h2 {
    display: inline-block;
    margin: 0 0 0.5em 1em;
    background-color: #f3f1e0;
    padding: 0 1em;
  }
`;

export default App;
