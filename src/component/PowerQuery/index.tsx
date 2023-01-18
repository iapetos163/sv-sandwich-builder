import { FormEvent, useCallback, useState } from 'react';
import styled from 'styled-components';
import { rangeMealPowers, rangeTypes } from '../../enum';
import { Power } from '../../types';
import PowerSelector from './PowerSelector';

const StyledContainer = styled.div``;
const StyledGrid = styled.div`
  display: grid;
  align-items: center;
  grid-template: auto auto auto auto / 55fr 45fr auto;
  /* gap: 5px 0; */
`;

const StyledHeading = styled.div`
  font-weight: bold;
  font-size: 0.9em;
`;

const allowedMealPowers = rangeMealPowers.map(() => true);

const allowedTypes = rangeTypes.map(() => true);

export interface PowerQueryProps {
  onSubmit: (queryPower: Power) => void;
  enableSubmit: boolean;
}

const PowerQuery = ({ onSubmit, enableSubmit }: PowerQueryProps) => {
  const [queryPower, setQueryPower] = useState<Power | null>(null);

  const handleSetPower = useCallback((power: Power | null) => {
    setQueryPower(power);
  }, []);

  const handleSubmit = useCallback(
    (evt: FormEvent) => {
      evt.preventDefault();
      if (queryPower) onSubmit(queryPower);
    },
    [queryPower, onSubmit],
  );
  return (
    <StyledContainer>
      <form onSubmit={handleSubmit}>
        <StyledGrid>
          <StyledHeading>Power</StyledHeading>
          <StyledHeading>Type</StyledHeading>
          <StyledHeading style={{ paddingLeft: '0.5rem' }}>Level</StyledHeading>
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
        </StyledGrid>
        <button type="submit" disabled={!queryPower || !enableSubmit}>
          Calculate!
        </button>
      </form>
    </StyledContainer>
  );
};
export default PowerQuery;
