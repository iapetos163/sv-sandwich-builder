import MealResult from '@/component/MealResult';
import PokeDollar from '@/component/PokeDollar';
import RecipeResult from '@/component/RecipeResult';
import SandwichResult from '@/component/SandwichResult';
import InitResult from './InitResult';
import s from './ResultSet.module.css';
import { Result, ResultState, ResultType } from './types';

export interface ResultSetProps {
  resultState: ResultState;
  results: Result[];
}

const ResultSet = ({ resultState, results }: ResultSetProps) => {
  if (resultState === ResultState.INIT) return <InitResult />;

  if (resultState === ResultState.CALCULATING)
    return <div className={s.resultsContainer}>Calculating...</div>;

  if (results.length === 0)
    return (
      <div className={s.resultsContainer}>
        Could not create a sandwich with the requested power.
      </div>
    );
  return (
    <>
      {/* FIXME dont use index as key */}
      {results.map(({ resultType, ...result }, i) => (
        <div className={s.resultsContainer} key={`${resultType}_${i}`}>
          {resultType === ResultType.MEAL && (
            <>
              <h2>Restaurant Meal</h2>
              <h3 className={s.resultSubheader}>
                {result.name} (<PokeDollar />
                {result.cost})
              </h3>
              <MealResult meal={result} />
            </>
          )}
          {resultType === ResultType.RECIPE && (
            <>
              <h2>Sandwich</h2>
              <h3 className={s.resultSubheader}>
                #{result.number} {result.name}
              </h3>
              <RecipeResult recipe={result} />
            </>
          )}
          {resultType === ResultType.CREATIVE && (
            <>
              <h2>Sandwich</h2>
              <h3 className={s.resultSubheader}>Creative Mode</h3>
              <SandwichResult sandwich={result} />
            </>
          )}
        </div>
      ))}
    </>
  );
};
export default ResultSet;
