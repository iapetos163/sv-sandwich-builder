import { getTargetTypeVector } from './powers';

describe('getTargetTypeVector', () => {
  it('Creates a vector with the correct components for Ground', () => {
    const v = getTargetTypeVector(
      { mealPower: 'Exp', type: 'Ground', level: 1 },
      [],
    );
    expect(v[4]).toBeGreaterThan(0);
  });
});
