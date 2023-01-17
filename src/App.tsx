import { FormEvent, ReactElement, useCallback, useState } from 'react';
import styled from 'styled-components';
import PowerSelector from './component/PowerQuery/PowerSelector';
import PowerQuery from './component/PowerQuery/index';
import SandwichResult from './component/SandwichResult';
import { rangeMealPowers, rangeTypes } from './enum';
import { makeSandwichForPower, powersEqual } from './mechanics';
import { Power, Sandwich } from './types';

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
    h2 {
      color: #888653;
      font-size: 1em;
      font-style: italic;
    }
  }
`;

const StyledSection = styled.div``;

const StyledSectionHeader = styled.div`
  border-bottom: 2px solid #888653;
  height: 0.5em;
  margin-bottom: 0.5em;

  h2 {
    display: inline-block;
    margin: 0 0 0 1em;
    background-color: #f3f1e0;
    padding: 0 1em;
  }
`;

function App(): ReactElement {
  const [resultSandwich, setResultSandwich] = useState<Sandwich | null>(null);
  const [queryPower, setQueryPower] = useState<Power | null>(null);
  const [queryChanged, setQueryChanged] = useState(true);
  const [calculating, setCalculating] = useState(false);

  const handleQuery = useCallback(
    (newQuery: Power) => {
      if (calculating) return;

      if (!queryPower || !powersEqual(queryPower, newQuery)) {
        setQueryChanged(true);
      }
      setQueryPower(newQuery);

      setCalculating(true);
      setTimeout(() => {
        const sandwich = makeSandwichForPower(newQuery);
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
        <StyledSection>
          <StyledSectionHeader>
            <h2>About</h2>
          </StyledSectionHeader>
          <p>
            {/* Input one or more meal powers, and this tool will attempt to find a
            meal or a sandwich recipe that yields those powers. */}
            Input a meal power, and this tool will attempt to find a a sandwich
            recipe that yields that power.
          </p>
        </StyledSection>
        <StyledSection>
          <StyledSectionHeader>
            <h2>Query</h2>
          </StyledSectionHeader>
          <PowerQuery onSubmit={handleQuery} enableSubmit={!calculating} />
        </StyledSection>
        <StyledSection>
          <StyledSectionHeader>
            <h2>Results</h2>
          </StyledSectionHeader>
        </StyledSection>
        <StyledSection>
          <StyledSectionHeader>
            <h2>Links</h2>
          </StyledSectionHeader>
        </StyledSection>
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

export default App;
