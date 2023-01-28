import { Flavor, rangeFlavors } from '../../enum';
import { getRelativeTasteVector } from './taste';

describe('getRelativeTasteVector', () => {
  it('Does not output infinite components', () => {
    const currentFlavorVector = rangeFlavors.map(() => 0);
    currentFlavorVector[Flavor.SALTY] = 20;
    currentFlavorVector[Flavor.SPICY] = 20;
    currentFlavorVector[Flavor.SWEET] = 16;
    const ingredientFlavorVector = rangeFlavors.map(() => 0);
    ingredientFlavorVector[Flavor.SWEET] = 12;
    ingredientFlavorVector[Flavor.SOUR] = 3;
    const res = getRelativeTasteVector({
      currentFlavorVector,
      ingredientFlavorVector,
    });

    expect(res).not.toContain(Infinity);
    expect(res).not.toContain(-Infinity);
  });

  it('Does not output any NaN components', () => {
    const currentFlavorVector = rangeFlavors.map(() => 0);
    currentFlavorVector[Flavor.BITTER] = 500;
    const ingredientFlavorVector = rangeFlavors.map(() => 0);
    ingredientFlavorVector[Flavor.SWEET] = 12;
    ingredientFlavorVector[Flavor.SOUR] = 9;
    ingredientFlavorVector[Flavor.BITTER] = 3;
    const res = getRelativeTasteVector({
      currentFlavorVector,
      ingredientFlavorVector,
    });

    const nanIndex = res.findIndex(isNaN);
    expect(nanIndex).toBe(-1);
  });

  it('Does not output a vector where any component has abs value >100', () => {
    const currentFlavorVector = rangeFlavors.map(() => 0);
    currentFlavorVector[Flavor.SALTY] = 48;
    currentFlavorVector[Flavor.SPICY] = 48;
    currentFlavorVector[Flavor.BITTER] = 24;
    const ingredientFlavorVector1 = rangeFlavors.map(() => 0);
    ingredientFlavorVector1[Flavor.SWEET] = 12;
    ingredientFlavorVector1[Flavor.SOUR] = 3;
    const res1 = getRelativeTasteVector({
      currentFlavorVector,
      ingredientFlavorVector: ingredientFlavorVector1,
    });
    const gt100_1 = res1.find((c) => Math.abs(c) > 100);
    expect(gt100_1).toBeUndefined();

    const ingredientFlavorVector2 = rangeFlavors.map(() => 0);
    ingredientFlavorVector2[Flavor.SWEET] = 16;
    ingredientFlavorVector2[Flavor.SALTY] = 12;
    const res2 = getRelativeTasteVector({
      currentFlavorVector,
      ingredientFlavorVector: ingredientFlavorVector2,
    });
    const gt100_2 = res2.find((c) => Math.abs(c) > 100);
    expect(gt100_2).toBeUndefined();
  });

  it('Outputs a positive Egg component when adding banana to chorizo', () => {
    const currentFlavorVector = rangeFlavors.map(() => 0);
    currentFlavorVector[Flavor.SALTY] = 48;
    currentFlavorVector[Flavor.BITTER] = 24;
    currentFlavorVector[Flavor.SPICY] = 48;

    const ingredientFlavorVector = rangeFlavors.map(() => 0);
    ingredientFlavorVector[Flavor.SWEET] = 12;
    ingredientFlavorVector[Flavor.SOUR] = 3;
    const res = getRelativeTasteVector({
      currentFlavorVector,
      ingredientFlavorVector,
    });

    expect(res[0]).toBeGreaterThan(0);
  });

  it('Outputs a positive Humungo component when adding Curry Powder to chorizo', () => {
    const currentFlavorVector = rangeFlavors.map(() => 0);
    currentFlavorVector[Flavor.SALTY] = 48;
    currentFlavorVector[Flavor.BITTER] = 24;
    currentFlavorVector[Flavor.SPICY] = 48;

    const ingredientFlavorVector = rangeFlavors.map(() => 0);
    ingredientFlavorVector[Flavor.SPICY] = 30;
    ingredientFlavorVector[Flavor.BITTER] = 12;
    ingredientFlavorVector[Flavor.SWEET] = 4;
    ingredientFlavorVector[Flavor.SALTY] = 4;
    ingredientFlavorVector[Flavor.SOUR] = 4;

    const res = getRelativeTasteVector({
      currentFlavorVector,
      ingredientFlavorVector,
    });

    expect(res[7]).toBeGreaterThan(0);
  });

  it('Outputs an Egg component for banana higher than that for fried fillet when adding to chorizo', () => {
    const currentFlavorVector = rangeFlavors.map(() => 0);
    currentFlavorVector[Flavor.SALTY] = 48;
    currentFlavorVector[Flavor.BITTER] = 24;
    currentFlavorVector[Flavor.SPICY] = 48;

    const bananaFlavorVector = rangeFlavors.map(() => 0);
    bananaFlavorVector[Flavor.SWEET] = 12;
    bananaFlavorVector[Flavor.SOUR] = 3;
    const bananaRes = getRelativeTasteVector({
      currentFlavorVector,
      ingredientFlavorVector: bananaFlavorVector,
    });

    const friedFlavorVector = rangeFlavors.map(() => 0);
    friedFlavorVector[Flavor.SALTY] = 3;
    friedFlavorVector[Flavor.BITTER] = 3;
    friedFlavorVector[Flavor.SWEET] = 2;
    const friedRes = getRelativeTasteVector({
      currentFlavorVector,
      ingredientFlavorVector: friedFlavorVector,
    });

    expect(bananaRes[0] - friedRes[0]).toBeGreaterThan(0);
  });

  it("Doesn't output a positive Exp component when adding banana to 4x chorizo + 1 potato salad", () => {
    const currentFlavorVector = rangeFlavors.map(() => 0);
    currentFlavorVector[Flavor.SALTY] = 51;
    currentFlavorVector[Flavor.SWEET] = 2;
    currentFlavorVector[Flavor.BITTER] = 25;
    currentFlavorVector[Flavor.SPICY] = 48;
    currentFlavorVector[Flavor.SOUR] = 4;

    const ingredientFlavorVector = rangeFlavors.map(() => 0);
    ingredientFlavorVector[Flavor.SWEET] = 12;
    ingredientFlavorVector[Flavor.SOUR] = 3;
    const res = getRelativeTasteVector({
      currentFlavorVector,
      ingredientFlavorVector,
    });

    expect(res[2]).toBeLessThanOrEqual(0);
  });

  it('Outputs nonzero components when choosing Herba Mystica at the start', () => {
    const currentFlavorVector = rangeFlavors.map(() => 0);
    const ingredientFlavorVector = rangeFlavors.map(() => 0);
    ingredientFlavorVector[Flavor.SWEET] = 500;
    const res = getRelativeTasteVector({
      currentFlavorVector,
      ingredientFlavorVector,
    });

    expect(res[0] || 0).toBeGreaterThan(0);
  });

  it('Outputs a higher Teensy component for Sour Herba Mystica than that for Bitter Herba Mystica', () => {
    const currentFlavorVector = rangeFlavors.map(() => 0);
    const sourHerbaFlavorVector = rangeFlavors.map(() => 0);
    sourHerbaFlavorVector[Flavor.SOUR] = 500;
    const sour = getRelativeTasteVector({
      currentFlavorVector,
      ingredientFlavorVector: sourHerbaFlavorVector,
    });
    const bitterHerbaFlavorVector = rangeFlavors.map(() => 0);
    bitterHerbaFlavorVector[Flavor.BITTER] = 500;
    const bitter = getRelativeTasteVector({
      currentFlavorVector,
      ingredientFlavorVector: bitterHerbaFlavorVector,
    });

    expect(sour[8]).toBeGreaterThan(bitter[8]);
  });
});
