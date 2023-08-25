import { ChangeEvent, FormEvent, useCallback, useState } from 'react';
import styled from 'styled-components';
import { rangeMealPowers, rangeTypes } from '../../enum';
import { Power } from '../../types';
import PowerSelector from './PowerSelector';

const StyledContainer = styled.div``;
const StyledGrid = styled.div`
  display: grid;
  align-items: center;
  grid-template: auto auto auto auto / 55fr 45fr auto auto;
  /* gap: 5px 0; */
`;

const StyledHeading = styled.div`
  font-weight: bold;
  font-size: 0.9em;
`;

const StyledAdd = styled.div`
  grid-column: 1 4;
`;

const StyledOptionsContainer = styled.div`
  display: flex;
  margin: 10px 0;
  font-size: 0.9em;
  > * {
    margin-right: 10px;
  }
  label {
    user-select: none;
  }
`;

const allowedMealPowers = rangeMealPowers.map(() => true);

const allowedTypes = rangeTypes.map(() => true);

export interface QueryOptions {
  includeMeals?: boolean;
  includeRecipes?: boolean;
}

export interface PowerQueryProps {
  onSubmit: (queryPowers: Power[], options?: QueryOptions) => void;
  enableSubmit: boolean;
}

const PowerQuery = ({ onSubmit, enableSubmit }: PowerQueryProps) => {
  const [firstQueryPower, setFirstQueryPower] = useState<Power | null>(null);
  const [secondQueryPower, setSecondQueryPower] = useState<Power | null>(null);
  const [thirdQueryPower, setThirdQueryPower] = useState<Power | null>(null);
  const [firstQueryOverride, setFirstQueryOverride] = useState<Power | null>(
    null,
  );
  const [includeMeals, setIncludeMeals] = useState(true);
  const [includeRecipes, setIncludeRecipes] = useState(true);
  const [secondQueryOverride, setSecondQueryOverride] = useState<Power | null>(
    null,
  );

  const [showSecond, setShowSecond] = useState(false);
  const [showThird, setShowThird] = useState(false);

  const handleSetFirstPower = useCallback((power: Power | null) => {
    setFirstQueryPower(power);
  }, []);
  const handleSetSecondPower = useCallback((power: Power | null) => {
    setSecondQueryPower(power);
  }, []);
  const handleSetThirdPower = useCallback((power: Power | null) => {
    setThirdQueryPower(power);
  }, []);

  const handleAddPower = useCallback(() => {
    if (showSecond) setShowThird(true);
    else setShowSecond(true);
  }, [showSecond]);

  const handleRemoveFirst = useCallback(() => {
    setFirstQueryOverride(secondQueryPower);
    setSecondQueryOverride(thirdQueryPower);
    setFirstQueryPower(secondQueryPower);
    setSecondQueryPower(thirdQueryPower);
    setThirdQueryPower(null);
    if (showThird) setShowThird(false);
    else setShowSecond(false);
  }, [secondQueryPower, thirdQueryPower, showThird]);

  const handleRemoveSecond = useCallback(() => {
    if (!showThird) {
      setSecondQueryOverride(null);
      setSecondQueryPower(null);
      setShowSecond(false);
      return;
    }
    setSecondQueryOverride(thirdQueryPower);
    setSecondQueryPower(thirdQueryPower);
    setThirdQueryPower(null);
    setShowThird(false);
  }, [showThird, thirdQueryPower]);

  const handleRemoveThird = useCallback(() => {
    setThirdQueryPower(null);
    setShowThird(false);
  }, []);

  const toggleMeals = useCallback((event: ChangeEvent<HTMLInputElement>) => {
    setIncludeMeals(event.target.checked);
  }, []);

  const toggleRecipes = useCallback((event: ChangeEvent<HTMLInputElement>) => {
    setIncludeRecipes(event.target.checked);
  }, []);

  const handleSubmit = useCallback(
    (evt: FormEvent) => {
      evt.preventDefault();
      const powers = [
        firstQueryPower,
        secondQueryPower,
        thirdQueryPower,
      ].filter((p): p is Power => !!p);
      if (powers.length > 0) onSubmit(powers, { includeMeals, includeRecipes });
    },
    [
      firstQueryPower,
      secondQueryPower,
      thirdQueryPower,
      onSubmit,
      includeMeals,
      includeRecipes,
    ],
  );
  return (
    <StyledContainer>
      <form onSubmit={handleSubmit}>
        <StyledGrid>
          <StyledHeading>Power</StyledHeading>
          <StyledHeading>Type</StyledHeading>
          <StyledHeading style={{ paddingLeft: '0.5rem' }}>Level</StyledHeading>
          <div />
          <PowerSelector
            onRemove={handleRemoveFirst}
            onChange={handleSetFirstPower}
            allowedMealPowers={allowedMealPowers}
            allowedTypes={allowedTypes}
            override={firstQueryOverride}
            maxLevel={3}
            removable={showSecond}
          />
          {showSecond && (
            <PowerSelector
              onRemove={handleRemoveSecond}
              onChange={handleSetSecondPower}
              allowedMealPowers={allowedMealPowers}
              allowedTypes={allowedTypes}
              override={secondQueryOverride}
              maxLevel={3}
              removable
            />
          )}

          {showThird && (
            <PowerSelector
              onRemove={handleRemoveThird}
              onChange={handleSetThirdPower}
              allowedMealPowers={allowedMealPowers}
              allowedTypes={allowedTypes}
              maxLevel={3}
              removable
            />
          )}
          {!showThird && (
            <StyledAdd>
              <button onClick={handleAddPower}>Add another power</button>
            </StyledAdd>
          )}
        </StyledGrid>
        <StyledOptionsContainer>
          <label>
            <input
              type="checkbox"
              checked={includeMeals}
              onChange={toggleMeals}
            ></input>{' '}
            Include restaurant meals
          </label>
          {/* <label>
            <input
              type="checkbox"
              checked={includeRecipes}
              onChange={toggleRecipes}
            ></input>{' '}
            Include sandwich recipes
          </label> */}
        </StyledOptionsContainer>
        <button type="submit" disabled={!firstQueryPower || !enableSubmit}>
          Calculate!
        </button>
      </form>
    </StyledContainer>
  );
};
export default PowerQuery;
