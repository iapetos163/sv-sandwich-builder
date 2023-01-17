import { ChangeEvent, useEffect, useMemo, useState } from 'react';
import { X, ChevronLeft, ChevronRight, AlertCircle } from 'react-feather';
import styled from 'styled-components';
import { MealPower, rangeMealPowers, rangeTypes, TypeIndex } from '../../enum';
import { mealPowerHasType } from '../../mechanics';
import { allTypes, mealPowerCopy } from '../../strings';
import { Power } from '../../types';

const StyledContainer = styled.div`
  display: flex;

  button {
    background: none;
    border: none;
    outline: inherit;
    padding: 0;
  }

  button:not(:disabled):hover {
    cursor: pointer;
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
  onChange: (power: Power | null) => void;
  allowedTypes: boolean[];
  allowedMealPowers: boolean[];
  removable?: boolean;
  maxLevel: number;
}

const PowerSelector = ({
  onRemove,
  onChange,
  removable,
  allowedTypes,
  allowedMealPowers,
  maxLevel,
}: PowerSelectorProps) => {
  const [selectedMealPower, setSelectedMealPower] = useState<MealPower | null>(
    null,
  );
  const [selectedType, setSelectedType] = useState<TypeIndex | null>(null);
  const [selectedLevel, setSelectedLevel] = useState(1);

  useEffect(() => {
    setSelectedLevel((prev) => (prev <= maxLevel ? prev : maxLevel));
  }, [maxLevel]);

  const handleChangeMealPower = (evt: ChangeEvent<HTMLSelectElement>) => {
    setSelectedMealPower(
      evt.target.value ? (parseInt(evt.target.value) as MealPower) : null,
    );
  };

  const handleChangeType = (evt: ChangeEvent<HTMLSelectElement>) => {
    setSelectedType(
      evt.target.value ? (parseInt(evt.target.value) as TypeIndex) : null,
    );
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
      onChange(null);
      return;
    }
    onChange({
      mealPower: selectedMealPower,
      type: selectedType!,
      level: selectedLevel,
    });
  }, [selectedMealPower, selectedType, onChange, selectedLevel, maxLevel]);

  return (
    <StyledContainer>
      <div style={{ flexShrink: 0, flexBasis: 30 }}>
        {isInvalid && <AlertCircle />}
      </div>
      <label style={{ flexShrink: 1, flexBasis: 300 }}>
        Meal Power:
        <select
          value={selectedMealPower ?? ''}
          onChange={handleChangeMealPower}
        >
          <option></option>
          {rangeMealPowers.map((powerIndex) => (
            <option
              key={powerIndex}
              value={powerIndex}
              disabled={!allowedMealPowers[powerIndex]}
            >
              {mealPowerCopy[powerIndex]}
            </option>
          ))}
        </select>
      </label>
      <div style={{ flexShrink: 1, flexBasis: 300 }}>
        {!selectedMealPower ||
          (mealPowerHasType(selectedMealPower) && (
            <label>
              Type:
              <select value={selectedType ?? ''} onChange={handleChangeType}>
                <option></option>
                {rangeTypes.map((t) => (
                  <option key={t} value={t} disabled={!allowedTypes[t]}>
                    {allTypes[t]}
                  </option>
                ))}
              </select>
            </label>
          ))}
      </div>
      <StyledLevelController style={{ flexShrink: 0, flexBasis: 70 }}>
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

      <div style={{ flexShrink: 0, flexBasis: 30 }}>
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
