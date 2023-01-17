import { FormEvent, useCallback, useState } from 'react';
import styled from 'styled-components';
import { rangeMealPowers, rangeTypes } from '../../enum';
import { Power } from '../../types';
import PowerSelector from './PowerSelector';

const StyledContainer = styled.div``;

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
        <button type="submit" disabled={!queryPower || !enableSubmit}>
          Calculate!
        </button>
      </form>
    </StyledContainer>
  );
};
export default PowerQuery;
