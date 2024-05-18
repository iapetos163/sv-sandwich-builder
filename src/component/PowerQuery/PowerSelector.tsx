import { ActionIcon, Button, Select } from '@mantine/core';
import { ChangeEvent, useEffect, useMemo, useState } from 'react';
import { X, ChevronLeft, ChevronRight } from 'react-feather';
import styled from 'styled-components';
import { MealPower, rangeMealPowers, rangeTypes, TypeIndex } from '../../enum';
import { mealPowerHasType } from '../../mechanics';
import { allTypes, mealPowerCopy } from '../../strings';
import { TargetPower } from '../../types';

const StyledLevelController = styled.div`
  display: flex;
  align-items: center;

  button {
    background: none;
    border: none;
    outline: inherit;
    padding: 0;
    color: #7ba06e;
    height: 2rem;
    width: 2rem;

    > svg {
      height: 60%;
    }

    &:disabled {
      color: #bcbcbc;
    }

    &:not(:disabled) {
      > svg {
        stroke-width: 3px;
      }

      &:hover {
        cursor: pointer;
      }
    }
  }
`;

const StyledLevelDisplay = styled.div`
  font-size: 1.3rem;
`;

export interface PowerSelectorProps {
  onRemove: () => void;
  onChange: (power: TargetPower | null) => void;
  override?: TargetPower | null;
  allowedTypes: boolean[];
  allowedMealPowers: boolean[];
  removable?: boolean;
  maxLevel: number;
}

const PowerSelector = ({
  onRemove,
  onChange,
  override = null,
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

  const handleChangeMealPower = (value: string | null) => {
    setSelectedMealPower(value ? (parseInt(value) as MealPower) : null);
  };

  const handleChangeType = (value: string | null) => {
    setSelectedType(value ? (parseInt(value) as TypeIndex) : null);
  };

  const decrementLevel = () => {
    setSelectedLevel((prev) => (prev > 1 ? prev - 1 : prev));
  };

  const incrementLevel = () => {
    setSelectedLevel((prev) => (prev < maxLevel ? prev + 1 : prev));
  };

  const isInvalid = useMemo(
    () =>
      (selectedMealPower !== null && !allowedMealPowers[selectedMealPower]) ||
      (selectedType !== null && !allowedTypes[selectedType]),
    [allowedTypes, allowedMealPowers, selectedMealPower, selectedType],
  );

  useEffect(() => {
    if (
      selectedMealPower === null ||
      (selectedType === null && mealPowerHasType(selectedMealPower)) ||
      selectedLevel > maxLevel
    ) {
      onChange(null);
      return;
    }
    onChange({
      mealPower: selectedMealPower,
      type: selectedType ?? 0,
      level: selectedLevel,
    });
  }, [selectedMealPower, selectedType, onChange, selectedLevel, maxLevel]);

  useEffect(() => {
    if (!override) return;

    setSelectedLevel(override.level);
    setSelectedMealPower(override.mealPower);
    if (mealPowerHasType(override.mealPower)) setSelectedType(override.type);
  }, [override]);

  return (
    <>
      {/* <div>{isInvalid && <AlertCircle />}</div> */}
      <div>
        <Select
          value={String(selectedMealPower ?? '')}
          onChange={handleChangeMealPower}
          data={[
            '',
            ...rangeMealPowers.map((powerIndex) => ({
              value: String(powerIndex),
              disabled: !allowedMealPowers[powerIndex],
              label: mealPowerCopy[powerIndex],
            })),
          ]}
        />
      </div>
      <div>
        {!selectedMealPower ||
          (mealPowerHasType(selectedMealPower) && (
            <Select
              value={String(selectedType ?? '')}
              onChange={handleChangeType}
              data={[
                '',
                ...rangeTypes.map((t) => ({
                  value: String(t),
                  disabled: !allowedTypes[t],
                  label: allTypes[t],
                })),
              ]}
            />
          ))}
      </div>
      <StyledLevelController>
        <ActionIcon
          variant="subtle"
          type="button"
          onClick={decrementLevel}
          disabled={selectedLevel <= 1}
        >
          <ChevronLeft />
        </ActionIcon>
        <StyledLevelDisplay>{selectedLevel}</StyledLevelDisplay>

        <ActionIcon
          variant="subtle"
          type="button"
          onClick={incrementLevel}
          disabled={selectedLevel >= maxLevel}
        >
          <ChevronRight />
        </ActionIcon>
      </StyledLevelController>

      <div style={{ flexShrink: 0, flexBasis: 30 }}>
        {removable && (
          <ActionIcon variant="subtle" type="button" onClick={onRemove}>
            <X />
          </ActionIcon>
        )}
      </div>
    </>
  );
};
export default PowerSelector;
