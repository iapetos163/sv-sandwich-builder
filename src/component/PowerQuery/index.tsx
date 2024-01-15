import {
  ChangeEvent,
  FormEvent,
  useCallback,
  useEffect,
  useState,
} from 'react';
import { rangeMealPowers, rangeTypes } from '@/enum';
import { TargetPower } from '@/types';
import styles from './PowerQuery.module.css';
import PowerSelector from './PowerSelector';

const allowedMealPowers = rangeMealPowers.map(() => true);

const allowedTypes = rangeTypes.map(() => true);

export interface QueryOptions {
  includePaldeaMeals?: boolean;
  includeKitakamiMeals?: boolean;
  includeBlueberryMeals?: boolean;
  includeRecipes?: boolean;
  includeCreative?: boolean;
  multiplayer?: boolean;
}

interface SelectedOptions {
  includeMeals: boolean;
  includePaldeaMeals: boolean;
  includeKitakamiMeals: boolean;
  includeBlueberryMeals: boolean;
  includeRecipes: boolean;
  includeCreative: boolean;
  multiplayer: boolean;
}

export interface PowerQueryProps {
  onSubmit: (queryPowers: TargetPower[], options?: QueryOptions) => void;
  enableSubmit: boolean;
}

const PowerQuery = ({ onSubmit, enableSubmit }: PowerQueryProps) => {
  const [firstQueryPower, setFirstQueryPower] = useState<TargetPower | null>(
    null,
  );
  const [secondQueryPower, setSecondQueryPower] = useState<TargetPower | null>(
    null,
  );
  const [thirdQueryPower, setThirdQueryPower] = useState<TargetPower | null>(
    null,
  );
  const [firstQueryOverride, setFirstQueryOverride] =
    useState<TargetPower | null>(null);

  const [options, setOptions] = useState<SelectedOptions>({
    includeMeals: true,
    includePaldeaMeals: true,
    includeKitakamiMeals: false,
    includeBlueberryMeals: false,
    includeRecipes: true,
    includeCreative: true,
    multiplayer: false,
  });
  const [secondQueryOverride, setSecondQueryOverride] =
    useState<TargetPower | null>(null);

  const [showSecond, setShowSecond] = useState(false);
  const [showThird, setShowThird] = useState(false);

  const handleSetFirstPower = useCallback((power: TargetPower | null) => {
    setFirstQueryPower(power);
  }, []);
  const handleSetSecondPower = useCallback((power: TargetPower | null) => {
    setSecondQueryPower(power);
  }, []);
  const handleSetThirdPower = useCallback((power: TargetPower | null) => {
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
    setOptions((prev) => ({ ...prev, includeMeals: event.target.checked }));
  }, []);

  const togglePaldeaMeals = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      setOptions((prev) => ({
        ...prev,
        includePaldeaMeals: event.target.checked,
      }));
    },
    [],
  );

  const toggleKitakamiMeals = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      setOptions((prev) => ({
        ...prev,
        includeKitakamiMeals: event.target.checked,
      }));
    },
    [],
  );

  const toggleBlueberryMeals = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      setOptions((prev) => ({
        ...prev,
        includeBlueberryMeals: event.target.checked,
      }));
    },
    [],
  );

  const toggleRecipes = useCallback((event: ChangeEvent<HTMLInputElement>) => {
    setOptions((prev) => ({ ...prev, includeRecipes: event.target.checked }));
  }, []);

  const toggleCreative = useCallback((event: ChangeEvent<HTMLInputElement>) => {
    setOptions((prev) => ({ ...prev, includeCreative: event.target.checked }));
  }, []);

  const toggleMultiplayer = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      setOptions((prev) => ({ ...prev, multiplayer: event.target.checked }));
    },
    [],
  );

  const handleSubmit = useCallback(
    (evt: FormEvent) => {
      evt.preventDefault();
      const powers = [
        firstQueryPower,
        secondQueryPower,
        thirdQueryPower,
      ].filter((p): p is TargetPower => !!p);
      if (powers.length > 0)
        onSubmit(powers, {
          includePaldeaMeals:
            options.includeMeals && options.includePaldeaMeals,
          includeKitakamiMeals:
            options.includeMeals && options.includeKitakamiMeals,
          includeBlueberryMeals:
            options.includeMeals && options.includeBlueberryMeals,
          includeRecipes: options.includeRecipes,
          includeCreative: options.includeCreative,
          multiplayer: options.multiplayer,
        });
    },
    [firstQueryPower, secondQueryPower, thirdQueryPower, onSubmit, options],
  );

  // Restore options from storage
  useEffect(() => {
    try {
      const optionsItem = localStorage.getItem('sandwichOptions');
      if (!optionsItem) return;
      const storedOptions = JSON.parse(optionsItem);
      setOptions((prev) => ({ ...prev, ...storedOptions }));
    } catch (e) {
      // pass
    }
  }, []);

  // Save options to storage
  useEffect(() => {
    localStorage.setItem('sandwichOptions', JSON.stringify(options));
  }, [options]);

  return (
    <div>
      <form onSubmit={handleSubmit}>
        <div className={styles.grid}>
          <div className={styles.heading}>Power</div>
          <div className={styles.heading}>Type</div>
          <div className={styles.heading} style={{ paddingLeft: '0.5rem' }}>
            Level
          </div>
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
            <div className={styles.add}>
              <button onClick={handleAddPower}>Add another power</button>
            </div>
          )}
        </div>
        <div className={styles.optionsContainer}>
          <div className={styles.heading}>Options</div>
          <div>
            <div>
              <label>
                <input
                  type="checkbox"
                  checked={options.includeMeals}
                  onChange={toggleMeals}
                ></input>{' '}
                Restaurant meals
              </label>
            </div>
            <div className={styles.suboptionsContainer}>
              <div
                className={options.includeMeals ? '' : styles.disabledOption}
              >
                <label>
                  <input
                    type="checkbox"
                    disabled={!options.includeMeals}
                    checked={options.includePaldeaMeals}
                    onChange={togglePaldeaMeals}
                  ></input>{' '}
                  Paldea
                </label>
              </div>
              <div
                className={options.includeMeals ? '' : styles.disabledOption}
              >
                <label>
                  <input
                    type="checkbox"
                    disabled={!options.includeMeals}
                    checked={options.includeKitakamiMeals}
                    onChange={toggleKitakamiMeals}
                  ></input>{' '}
                  Kitakami
                </label>
              </div>
              <div
                className={options.includeMeals ? '' : styles.disabledOption}
              >
                <label>
                  <input
                    type="checkbox"
                    disabled={!options.includeMeals}
                    checked={options.includeBlueberryMeals}
                    onChange={toggleBlueberryMeals}
                  ></input>{' '}
                  Blueberry Academy (cost BP)
                </label>
              </div>
            </div>
            <div>
              <label>
                <input
                  type="checkbox"
                  checked={options.includeRecipes}
                  onChange={toggleRecipes}
                ></input>{' '}
                Sandwich recipes
              </label>
            </div>
            <div>
              <label>
                <input
                  type="checkbox"
                  checked={options.includeCreative}
                  onChange={toggleCreative}
                ></input>{' '}
                Creative mode sandwiches
              </label>
            </div>
            <div>
              <label>
                <input
                  type="checkbox"
                  checked={options.multiplayer}
                  onChange={toggleMultiplayer}
                ></input>{' '}
                Multiplayer
              </label>
            </div>
          </div>
        </div>
        <button type="submit" disabled={!firstQueryPower || !enableSubmit}>
          Calculate!
        </button>
      </form>
    </div>
  );
};
export default PowerQuery;
