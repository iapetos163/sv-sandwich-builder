import { ReactElement, useCallback, useState } from 'react';
import { GitHub } from 'react-feather';
import styled from 'styled-components';
import PowerQuery from './component/PowerQuery';
import RecipeResult from './component/RecipeResult';
import SandwichResult from './component/SandwichResult';
import {
  getRecipeForPowers,
  makeSandwichForPowers,
  powersEqual,
} from './mechanics';
import { Power, Sandwich, SandwichRecipe } from './types';

const StyledContainer = styled.div`
  margin: 15px 10px;
  color: #1d261a;
  display: flex;
  flex-direction: column;
  align-items: center;

  h1 {
    margin-top: 0;
  }

  h3 {
    font-size: 1em;
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

const StyledSection = styled.div`
  margin-bottom: 15px;
`;

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

const StyledTitle = styled.h1`
  position: relative;
  display: inline-block;
`;

const StyledTitleTag = styled.span`
  color: #db280b;
  text-transform: uppercase;
  position: absolute;
  bottom: -0.6em;
  right: -0.5em;
  font-size: 0.5em;
`;

const StyledResultsContainer = styled.div``;
const StyledResultSubheader = styled.h3``;

function App(): ReactElement {
  const [resultCreativeSandwich, setResultCreativeSandwich] =
    useState<Sandwich | null>(null);
  const [resultRecipe, setResultRecipe] = useState<SandwichRecipe | null>(null);
  const [queryPowers, setQueryPowers] = useState<Power[]>([]);
  const [queryChanged, setQueryChanged] = useState(true);
  const [calculating, setCalculating] = useState(false);

  const handleQuery = useCallback(
    (newQuery: Power[]) => {
      if (calculating) return;

      if (
        queryPowers.length === 0 ||
        newQuery.length !== queryPowers.length ||
        queryPowers.some((qp, i) => !powersEqual(qp, newQuery[i]))
      ) {
        setQueryChanged(true);
      }
      setQueryPowers(newQuery);

      setCalculating(true);
      setTimeout(() => {
        const recipe = getRecipeForPowers(newQuery);
        if (recipe) {
          setResultCreativeSandwich(null);
          setResultRecipe(recipe);
        } else {
          const creativeSandwich = makeSandwichForPowers(newQuery);
          setResultCreativeSandwich(creativeSandwich);
          setResultRecipe(null);
        }
        setQueryChanged(false);
        setCalculating(false);
      }, 10);
    },
    [calculating, queryPowers],
  );

  return (
    <StyledContainer>
      <header>
        <h2>Pokémon Scarlet/Violet</h2>
        <StyledTitle>
          Sandwich Calculator <StyledTitleTag>Alpha</StyledTitleTag>
        </StyledTitle>
      </header>
      <main>
        <StyledSection>
          <StyledSectionHeader>
            <h2>About</h2>
          </StyledSectionHeader>
          <p>
            {/* Input one or more meal powers, and this tool will attempt to find a
            meal or a sandwich recipe that yields those powers. */}
            {/* Also update in README */}
            Input a meal power, and this tool will attempt to find a sandwich
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
          <StyledResultsContainer>
            {calculating && <>Calculating...</>}
            {!calculating &&
              queryChanged &&
              !resultCreativeSandwich &&
              !resultRecipe && (
                <>Input a Meal Power query above and press Calculate!.</>
              )}
            {!calculating &&
              !queryChanged &&
              !resultCreativeSandwich &&
              !resultRecipe && (
                <>Could not create a sandwich with the requested power.</>
              )}
            {!calculating && resultRecipe && (
              <>
                <h2>Sandwich</h2>
                <StyledResultSubheader>
                  #{resultRecipe.number} {resultRecipe.name}
                </StyledResultSubheader>
                <RecipeResult recipe={resultRecipe} />
              </>
            )}
            {!calculating && resultCreativeSandwich && (
              <>
                <h2>Sandwich</h2>
                <StyledResultSubheader>Creative Mode</StyledResultSubheader>
                <SandwichResult sandwich={resultCreativeSandwich} />
              </>
            )}
          </StyledResultsContainer>
        </StyledSection>
        <StyledSection>
          <StyledSectionHeader>
            <h2>Links</h2>
          </StyledSectionHeader>
          <div>
            <a
              href="https://github.com/iapetos163/sv-sandwich-builder/issues"
              target="_blank"
              rel="noreferrer"
            >
              <GitHub /> Report a bug on GitHub
            </a>
          </div>
          <div>
            <a
              href="https://github.com/iapetos163/sv-sandwich-builder"
              target="_blank"
              rel="noreferrer"
            >
              <GitHub /> View project source on GitHub
            </a>
          </div>
          <div>
            This project would not have been possible without data and code from
            the{' '}
            <a
              href="https://cecilbowen.github.io/pokemon-sandwich-simulator/"
              target="_blank"
              rel="noreferrer"
            >
              Pokémon Sandwich Simulator
            </a>
            .
          </div>
        </StyledSection>
      </main>
    </StyledContainer>
  );
}

export default App;
