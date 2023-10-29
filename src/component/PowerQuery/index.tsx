import { FormEvent, useCallback, useState } from 'react';
import Checkbox from '@/component/Checkbox';
import { rangeMealPowers, rangeTypes } from '@/enum';
import { TargetPower } from '@/types';
import styles from './PowerQuery.module.css';
import PowerSelector from './PowerSelector';

const allowedMealPowers = rangeMealPowers.map(() => true);

const allowedTypes = rangeTypes.map(() => true);

export interface QueryOptions {
  includeMeals?: boolean;
  includeRecipes?: boolean;
  includeCreative?: boolean;
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
  const [includeMeals, setIncludeMeals] = useState(true);
  const [includeRecipes, setIncludeRecipes] = useState(true);
  const [includeCreative, setIncludeCreative] = useState(true);
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

  const toggleMeals = useCallback((checked: boolean) => {
    setIncludeMeals(checked);
  }, []);

  const toggleRecipes = useCallback((checked: boolean) => {
    setIncludeRecipes(checked);
  }, []);

  const toggleCreative = useCallback((checked: boolean) => {
    setIncludeCreative(checked);
  }, []);

  const handleSubmit = useCallback(
    (evt: FormEvent) => {
      evt.preventDefault();
      const powers = [
        firstQueryPower,
        secondQueryPower,
        thirdQueryPower,
      ].filter((p): p is TargetPower => !!p);
      if (powers.length > 0)
        onSubmit(powers, { includeMeals, includeRecipes, includeCreative });
    },
    [
      firstQueryPower,
      secondQueryPower,
      thirdQueryPower,
      onSubmit,
      includeMeals,
      includeRecipes,
      includeCreative,
    ],
  );
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
                <Checkbox
                  checked={includeMeals}
                  onCheckedChange={toggleMeals}
                />
                Restaurant meals
              </label>
            </div>
            <div>
              <label>
                <Checkbox
                  checked={includeRecipes}
                  onCheckedChange={toggleRecipes}
                />
                Sandwich recipes
              </label>
            </div>
            <div>
              <label>
                <Checkbox
                  checked={includeCreative}
                  onCheckedChange={toggleCreative}
                />
                Creative mode sandwiches
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
