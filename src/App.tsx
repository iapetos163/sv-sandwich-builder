import { ReactElement, useCallback, useMemo, useState } from 'react';
import { GitHub } from 'react-feather';
import MealResult from '@/component/MealResult';
import PokeDollar from '@/component/PokeDollar';
import PowerQuery, { QueryOptions } from '@/component/PowerQuery';
import RecipeResult from '@/component/RecipeResult';
import SandwichResult from '@/component/SandwichResult';
import { powersEqual } from '@/mechanics';
import {
  getMealForPowers,
  getRecipeForPowers,
  makeSandwichesForPowers,
} from '@/search';
import { Meal, Power, Sandwich, SandwichRecipe } from '@/types';

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
          const creativeSandwiches = await makeSandwichesForPowers(newQuery);
          setResultCreativeSandwich(creativeSandwiches[0] ?? null);
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
    <>
      <section>
        <div className="sectionHeader">
          <h2>Query</h2>
        </div>
        <PowerQuery onSubmit={handleQuery} enableSubmit={!calculating} />
      </section>
      <section>
        <div className="sectionHeader">
          <h2>Results</h2>
        </div>
        {/* TODO */}
      </section>
      <section className="links">
        <div className="sectionHeader">
          <h2>Links</h2>
        </div>
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
      </section>
    </>
  );
}

export default App;
