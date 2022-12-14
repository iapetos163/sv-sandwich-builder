import { ChangeEvent, useEffect, useMemo, useState } from 'react';
import { X, ChevronLeft, ChevronRight, AlertCircle } from 'react-feather';
import styled from 'styled-components';
import { allTypes, mealPowerHasType, mealPowers, Power } from '../powers';

const StyledContainer = styled.div`
  display: flex;
  /* width: 800px; */
  > * {
    margin: 0 10px;
  }
`;

const StyledLevelController = styled.div`
  display: flex;
`;

const StyledLevelDisplay = styled.div`
  margin: 0 5px;
`;

export interface PowerSelectorProps {
  onRemove: () => void;
  onSetPower: (power: Power) => void;
  allowedTypes: Record<string, true>;
  allowedMealPowers: Record<string, true>;
  removable?: boolean;
  maxLevel: number;
}

const PowerSelector = ({
  onRemove,
  onSetPower,
  removable,
  allowedTypes,
  allowedMealPowers,
  maxLevel,
}: PowerSelectorProps) => {
  const [selectedMealPower, setSelectedMealPower] = useState('');
  const [selectedType, setSelectedType] = useState('');
  const [selectedLevel, setSelectedLevel] = useState(1);

  useEffect(() => {
    setSelectedLevel((prev) => (prev <= maxLevel ? prev : maxLevel));
  }, [maxLevel]);

  const handleChangeMealPower = (evt: ChangeEvent<HTMLSelectElement>) => {
    setSelectedMealPower(evt.target.value);
  };

  const handleChangeType = (evt: ChangeEvent<HTMLSelectElement>) => {
    setSelectedType(evt.target.value);
  };

  const decrementLevel = () => {
    setSelectedLevel((prev) => (prev > 1 ? prev - 1 : prev));
  };

  const incrementLevel = () => {
    setSelectedLevel((prev) => (prev < maxLevel ? prev + 1 : prev));
  };

  const isInvalid = useMemo(
    () =>
      (selectedMealPower && !allowedMealPowers[selectedMealPower]) ||
      (selectedType && !allowedTypes[selectedType]),
    [allowedTypes, allowedMealPowers, selectedMealPower, selectedType],
  );

  useEffect(() => {
    if (
      !selectedMealPower ||
      (!selectedType && mealPowerHasType(selectedMealPower)) ||
      selectedLevel > maxLevel
    ) {
      return;
    }
    onSetPower({
      mealPower: selectedMealPower,
      type: selectedType,
      level: selectedLevel,
    });
  }, [selectedMealPower, selectedType, onSetPower, selectedLevel, maxLevel]);

  return (
    <StyledContainer>
      <div style={{ flexShrink: 1, flexBasis: 40 }}>
        {isInvalid && <AlertCircle />}
      </div>
      <label style={{ flexShrink: 4, flexBasis: 300 }}>
        Meal Power:
        <select value={selectedMealPower} onChange={handleChangeMealPower}>
          <option></option>
          {mealPowers.map((power) => (
            <option key={power} disabled={!allowedMealPowers[power]}>
              {power}
            </option>
          ))}
        </select>
      </label>
      <div style={{ flexShrink: 4, flexBasis: 300 }}>
        {mealPowerHasType(selectedMealPower) && (
          <label>
            Type:
            <select value={selectedType} onChange={handleChangeType}>
              <option></option>
              {allTypes.map((t) => (
                <option key={t} disabled={!allowedTypes[t]}>
                  {t}
                </option>
              ))}
            </select>
          </label>
        )}
      </div>
      <StyledLevelController style={{ flexShrink: 2, flexBasis: 100 }}>
        <button
          type="button"
          onClick={decrementLevel}
          disabled={selectedLevel <= 1}
        >
          <ChevronLeft />
        </button>
        <StyledLevelDisplay>{selectedLevel}</StyledLevelDisplay>

        <button
          type="button"
          onClick={incrementLevel}
          disabled={selectedLevel >= maxLevel}
        >
          <ChevronRight />
        </button>
      </StyledLevelController>

      <div style={{ flexShrink: 1, flexBasis: 40 }}>
        {removable && (
          <button type="button" onClick={onRemove}>
            <X />
          </button>
        )}
      </div>
    </StyledContainer>
  );
};
export default PowerSelector;
