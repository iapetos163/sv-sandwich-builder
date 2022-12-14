import { ChangeEvent, useEffect, useState } from 'react';
import { X } from 'react-feather';
import { allTypes, mealPowerHasType, mealPowers, Power } from '../powers';

export interface PowerSelectorProps {
  onRemove: () => void;
  onSetPower: (power: Power) => void;
  allowedTypes: Record<string, true>;
  allowedMealPowers: Record<string, true>;
  removable: boolean;
}

const PowerSelector = ({
  onRemove,
  onSetPower,
  removable,
  allowedTypes,
  allowedMealPowers,
}: PowerSelectorProps) => {
  const [selectedMealPower, setSelectedMealPower] = useState('');
  const [selectedType, setSelectedType] = useState('');

  const handleChangeMealPower = (evt: ChangeEvent<HTMLSelectElement>) => {
    setSelectedMealPower(evt.target.value);
  };

  const handleChangeType = (evt: ChangeEvent<HTMLSelectElement>) => {
    setSelectedType(evt.target.value);
  };

  useEffect(() => {
    if (
      !selectedMealPower ||
      (!selectedType && mealPowerHasType(selectedMealPower))
    ) {
      return;
    }
    onSetPower({
      mealPower: selectedMealPower,
      type: selectedType,
    });
  }, [selectedMealPower, selectedType, onSetPower]);

  return (
    <div>
      <label>
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
      {removable && (
        <button type="button" onClick={onRemove}>
          <X />
        </button>
      )}
    </div>
  );
};
export default PowerSelector;
