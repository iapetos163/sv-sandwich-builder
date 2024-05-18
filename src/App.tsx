import { MantineProvider, Stack, Text, Title } from '@mantine/core';
import { ReactElement, useCallback, useState } from 'react';
import { GitHub } from 'react-feather';
import PowerQuery, { QueryOptions } from '@/component/PowerQuery';
import ResultSet, {
  CreativeResult,
  MealResult,
  RecipeResult,
  Result,
  ResultState,
  ResultType,
} from '@/component/ResultSet';
import {
  getMealsForPowers,
  getRecipesForPowers,
  makeSandwichesForPowers,
} from '@/search';
import { TargetPower } from '@/types';
import s from './App.module.css';

import '@mantine/core/styles.css';
import 'swiper/css';

function App(): ReactElement {
  const [results, setResults] = useState<Result[]>([]);
  const [resultState, setResultState] = useState<ResultState>(ResultState.INIT);

  const handleQuery = useCallback(
    (newQuery: TargetPower[], options: QueryOptions = {}) => {
      if (resultState === ResultState.CALCULATING) return;

      const results: Result[] = [];
      if (
        options.includePaldeaMeals ||
        options.includeKitakamiMeals ||
        options.includeBlueberryMeals
      ) {
        const meals = getMealsForPowers(newQuery, {
          excludePaldea: !options.includePaldeaMeals,
          kitakami: options.includeKitakamiMeals,
          blueberry: options.includeBlueberryMeals,
        });
        results.push(
          ...meals.map(
            (m): MealResult => ({ resultType: ResultType.MEAL, ...m }),
          ),
        );
      }

      if (options.includeRecipes) {
        const recipes = getRecipesForPowers(newQuery);
        results.push(
          ...recipes.map(
            (r): RecipeResult => ({
              resultType: ResultType.RECIPE,
              ...r,
            }),
          ),
        );
      }

      if (options.includeCreative) {
        setResultState(ResultState.CALCULATING);
        setTimeout(async () => {
          const creativeSandwiches = await makeSandwichesForPowers(
            newQuery,
            options.multiplayer,
            options.noHerba,
          );
          results.push(
            ...creativeSandwiches.map(
              (s): CreativeResult => ({
                resultType: ResultType.CREATIVE,
                ...s,
              }),
            ),
          );
          setResults(results);
          setResultState(ResultState.RESULT);
        }, 10);
      } else {
        setResults(results);
        setResultState(ResultState.RESULT);
      }
    },
    [resultState],
  );

  return (
    <MantineProvider>
      <Stack>
        <Stack component="section">
          <div className="sectionHeader">
            <Title order={2}>Query</Title>
          </div>
          <PowerQuery
            onSubmit={handleQuery}
            enableSubmit={resultState !== ResultState.CALCULATING}
          />
        </Stack>
        <Stack component="section">
          <div className="sectionHeader">
            <Title order={2}>Results</Title>
          </div>
          <div className={s.resultSetContainer}>
            <ResultSet results={results} resultState={resultState} />
          </div>
        </Stack>
        <Stack component="section" className="links">
          <div className="sectionHeader">
            <Title order={2}>Links</Title>
          </div>
          <Text>
            <a
              href="https://github.com/iapetos163/sv-sandwich-builder/issues"
              target="_blank"
              rel="noreferrer"
            >
              <GitHub /> Report a bug on GitHub
            </a>
          </Text>
          <Text>
            <a
              href="https://github.com/iapetos163/sv-sandwich-builder"
              target="_blank"
              rel="noreferrer"
            >
              <GitHub /> View project source on GitHub
            </a>
          </Text>
          <Text>
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
          </Text>
        </Stack>
      </Stack>
    </MantineProvider>
  );
}

export default App;
