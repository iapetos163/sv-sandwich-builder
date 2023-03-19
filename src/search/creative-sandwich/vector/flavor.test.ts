import { Flavor, MealPower } from '../../../enum';
import { getFlavorProfilesForPower } from '../../../mechanics';
import { getTargetFlavorVector } from './flavor';

describe('getTargetFlavorVector', () => {
  it('Does not output a zero vector for boosting Egg Power', () => {
    const res = getTargetFlavorVector({
      flavorVector: [],
      flavorProfile: getFlavorProfilesForPower(MealPower.EGG)[0],
      rankedFlavorBoosts: [],
    });

    expect(res[Flavor.SWEET]).toBeGreaterThan(0);
  });
});
