import { getTypeVector } from './powers';

describe('getTypeVector', () => {
  it('Creates a vector with the correct components for Ground', () => {
    const v = getTypeVector({ mealPower: 'Exp', type: 'Ground', level: 1 }, 1);
    expect(v[4]).toBeGreaterThan(0);
  });
});
