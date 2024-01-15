import { HTMLAttributes, useEffect, useRef } from 'react';
import { css } from 'styled-components';
//@ts-ignore
import type { SwiperContainer } from 'swiper/element';
//@ts-ignore
import type { SwiperModule } from 'swiper/types';
import MealResult from '@/component/MealResult';
import PokeDollar from '@/component/PokeDollar';
import RecipeResult from '@/component/RecipeResult';
import SandwichResult from '@/component/SandwichResult';
import { Currency } from '@/enum';
import InitResult from './InitResult';
import s from './ResultSet.module.css';
import { Result, ResultState, ResultType } from './types';

let registered = false;
const modules: SwiperModule[] = [];
(async () => {
  try {
    const { register } = await import('swiper/element-bundle');
    const { Navigation } = await import('swiper/modules');
    modules.push(Navigation);
    register();
    registered = true;
  } catch (e) {
    console.error(e);
  }
})();

export interface ResultSetProps {
  resultState: ResultState;
  results: Result[];
}

const ResultSet = ({ resultState, results }: ResultSetProps) => {
  const swiperRef = useRef<SwiperContainer>(null);

  useEffect(() => {
    if (!swiperRef.current || !registered) return;
    const swiper = swiperRef.current;
    swiper.modules = modules;
    swiper.navigation = true;
    swiper.slidesPerView = 1.2;
    swiper.breakpoints = {
      600: {
        slidesPerView: 1.5,
      },
    };
    swiper.loop = results.length >= 4;
    swiper.centeredSlides = true;
    swiper.slideToClickedSlide = true;
    swiper.slideNextClass = s.slideInactive;
    swiper.slidePrevClass = s.slideInactive;
    swiper.injectStyles = [
      css`
        .swiper-wrapper {
          align-items: center;
        }
      `.toString(),
    ];
    swiper.a11y = {
      enabled: true,
    };

    swiper.initialize();
  }, [results]);

  if (resultState === ResultState.INIT) return <InitResult />;

  if (resultState === ResultState.CALCULATING)
    return <div className={s.resultsContainer}>Calculating...</div>;

  if (results.length === 0)
    return (
      <div className={s.resultsContainer}>
        Could not create a sandwich with the requested powers.
      </div>
    );

  const SetWrapper =
    results.length > 1
      ? ({ children, ...props }: HTMLAttributes<HTMLDivElement>) => (
          //@ts-ignore
          <swiper-container {...props} ref={swiperRef} init="false">
            {children}
            {/* @ts-ignore */}
          </swiper-container>
        )
      : ({ children, ...props }: HTMLAttributes<HTMLDivElement>) => (
          <div {...props}>{children}</div>
        );
  const ItemWrapper =
    results.length > 1
      ? ({
          children,
          ...props
        }: HTMLAttributes<HTMLDivElement> & Record<string, any>) => (
          //@ts-ignore
          <swiper-slide {...props}>{children}</swiper-slide>
        )
      : ({ children, ...props }: HTMLAttributes<HTMLDivElement>) => (
          <div {...props}>{children}</div>
        );

  return (
    <SetWrapper className={s.wrapper}>
      {results.map((result, i) => (
        <ItemWrapper
          key={`${result.resultType}_${result.number ?? result.name ?? i}`}
        >
          <div className={s.resultsContainer}>
            {result.resultType === ResultType.MEAL && (
              <>
                <h2>Restaurant Meal</h2>
                <h3 className={s.resultSubheader}>
                  {result.name}{' '}
                  {result.currency === Currency.POKE && (
                    <>
                      (<PokeDollar />
                      {result.cost})
                    </>
                  )}
                  {result.currency === Currency.BP && `(${result.cost} BP)`}
                </h3>
                <MealResult meal={result} />
              </>
            )}
            {result.resultType === ResultType.RECIPE && (
              <>
                <h2>Sandwich</h2>
                <h3 className={s.resultSubheader}>
                  #{result.number} {result.name}
                </h3>
                <RecipeResult recipe={result} />
              </>
            )}
            {result.resultType === ResultType.CREATIVE && (
              <>
                <h2>Sandwich</h2>
                <h3 className={s.resultSubheader}>Creative Mode</h3>
                <SandwichResult sandwich={result} />
              </>
            )}
          </div>
        </ItemWrapper>
      ))}
    </SetWrapper>
  );
};
export default ResultSet;
