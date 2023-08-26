import { ReactElement, useCallback, useMemo, useState } from 'react';
import { GitHub } from 'react-feather';
import styled from 'styled-components';
import MealResult from './component/MealResult';
import PokeDollar from './component/PokeDollar';
import PowerQuery, { QueryOptions } from './component/PowerQuery';
import RecipeResult from './component/RecipeResult';
import SandwichResult from './component/SandwichResult';
import { powersEqual } from './mechanics';
import {
  getMealForPowers,
  getRecipeForPowers,
  makeSandwichForPowers,
} from './search';
import { Meal, Power, Sandwich, SandwichRecipe } from './types';

const StyledContainer = styled.div`
  margin: 15px 10px;
  color: #1d261a;
  display: flex;
  flex-direction: column;
  align-items: center;

  main {
    max-width: 640px;
  }

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
`;

const StyledSection = styled.div`
  margin-bottom: 15px;
  display: flex;
  max-width: 95vw;
  flex-direction: column;
  align-items: center;
`;

const StyledSectionHeader = styled.div`
  border-bottom: 2px solid #888653;
  height: 0.5em;
  margin-bottom: 0.5em;
  width: 100%;

  h2 {
    color: #888653;
    font-size: 1em;
    font-style: italic;
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

const StyledResultsContainer = styled.div`
  text-align: center;
  background-color: #e2ddba;
  padding: 20px;
  max-width: 600px;
  min-width: 50%;
  h2 {
    color: #1d261a;
    margin: 0 0 0.3em;
  }
`;
const StyledResultSubheader = styled.h3`
  font-weight: 600;
  margin: 0.3em;
`;

const StyledLinksSection = styled(StyledSection)`
  display: block;
  svg {
    height: 1em;
    stroke: #1d261a;
  }
`;

function App(): ReactElement {
  const [resultCreativeSandwich, setResultCreativeSandwich] =
    useState<Sandwich | null>(null);
  const [resultRecipe, setResultRecipe] = useState<SandwichRecipe | null>(null);
  const [resultMeal, setResultMeal] = useState<Meal | null>(null);
  const [queryPowers, setQueryPowers] = useState<Power[]>([]);
  const [queryChanged, setQueryChanged] = useState(true);
  const [calculating, setCalculating] = useState(false);
  const [lastIncludeMeals, setLastIncludeMeals] = useState(true);
  const [lastIncludeRecipes, setLastIncludeRecipes] = useState(true);
  const [lastIncludeCreative, setLastIncludeCreative] = useState(true);

  const handleQuery = useCallback(
    (newQuery: Power[], options: QueryOptions = {}) => {
      if (calculating) return;

      if (
        queryPowers.length === 0 ||
        newQuery.length !== queryPowers.length ||
        lastIncludeMeals !== (options.includeMeals ?? false) ||
        lastIncludeRecipes !== (options.includeRecipes ?? false) ||
        lastIncludeCreative !== (options.includeCreative ?? false) ||
        queryPowers.some((qp, i) => !powersEqual(qp, newQuery[i]))
      ) {
        setQueryChanged(true);
      }
      setQueryPowers(newQuery);
      setLastIncludeMeals(options.includeMeals ?? false);
      setLastIncludeRecipes(options.includeRecipes ?? false);
      setLastIncludeCreative(options.includeCreative ?? false);

      if (options.includeMeals) {
        const meal = getMealForPowers(newQuery);
        if (meal) {
          setResultCreativeSandwich(null);
          setResultRecipe(null);
          setResultMeal(meal);
          setQueryChanged(false);
          return;
        }
      }
      setResultMeal(null);

      if (options.includeRecipes) {
        const recipe = getRecipeForPowers(newQuery);
        if (recipe) {
          setResultCreativeSandwich(null);
          setResultRecipe(recipe);
          setQueryChanged(false);
          return;
        }
      }
      setResultRecipe(null);

      if (options.includeCreative) {
        setCalculating(true);
        setTimeout(async () => {
          const creativeSandwich = await makeSandwichForPowers(newQuery);
          setResultCreativeSandwich(creativeSandwich);
          setQueryChanged(false);
          setCalculating(false);
        }, 10);
      }
      setResultCreativeSandwich(null);
    },
    [
      calculating,
      queryPowers,
      lastIncludeMeals,
      lastIncludeRecipes,
      lastIncludeCreative,
    ],
  );

  const noResult = useMemo(
    () =>
      !calculating && !resultCreativeSandwich && !resultRecipe && !resultMeal,
    [calculating, resultCreativeSandwich, resultMeal, resultRecipe],
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
            Input one or more meal powers, and this tool will find a meal or a
            sandwich recipe that yields those powers.
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
            {queryChanged && noResult && (
              <>Input a Meal Power query above and press Calculate!.</>
            )}
            {!queryChanged && noResult && (
              <>Could not create a sandwich with the requested power.</>
            )}
            {!calculating && resultMeal && (
              <>
                <h2>Restaurant Meal</h2>
                <StyledResultSubheader>
                  {resultMeal.name} (<PokeDollar />
                  {resultMeal.cost})
                </StyledResultSubheader>
                <MealResult meal={resultMeal} />
              </>
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
        <StyledLinksSection>
          <StyledSectionHeader>
            <h2>Links</h2>
          </StyledSectionHeader>
          <p>
            <a
              href="https://github.com/iapetos163/sv-sandwich-builder/issues"
              target="_blank"
              rel="noreferrer"
            >
              <GitHub /> Report a bug on GitHub
            </a>
          </p>
          <p>
            <a
              href="https://github.com/iapetos163/sv-sandwich-builder"
              target="_blank"
              rel="noreferrer"
            >
              <GitHub /> View project source on GitHub
            </a>
          </p>
          <p>
            This project would not have been possible without data and code from
            the{' '}
            <a
              href="https://cecilbowen.github.io/pokemon-sandwich-simulator/"
              target="_blank"
              rel="noreferrer"
            >
              Pokémon&nbsp;Sandwich&nbsp;Simulator
            </a>
            .
          </p>
        </StyledLinksSection>
      </main>
    </StyledContainer>
  );
}

export default App;
