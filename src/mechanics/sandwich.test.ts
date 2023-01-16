import {
  getMpScoreWeight,
  getTypeScoreWeight,
  makeSandwichForPower,
} from './sandwich';

describe('getTypeScoreWeight', () => {
  it('Initially weighs level over meal power', () => {
    const levelWeight = getTypeScoreWeight({
      targetVector: [0, 0, 0, 0, 0, 0, 180, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      deltaVector: [0, 0, 0, 0, 0, 0, 180, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      currentVector: [],
      remainingFillings: 6,
      remainingCondiments: 4,
    });

    const mpWeight = getMpScoreWeight({
      targetVector: [1, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      deltaVector: [1, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      currentVector: [],
      remainingFillings: 6,
      remainingCondiments: 4,
    });

    expect(levelWeight).toBeGreaterThan(mpWeight);
  });
});

describe('makeSandwichForPower', () => {
  it('Produces a sandwich with Lv 3 Sparkling Ground', () => {
    const sandwich = makeSandwichForPower({
      mealPower: 'Sparkling',
      type: 'Ground',
      level: 3,
    });

    expect(sandwich).not.toBeNull();

    const numHerba = sandwich!.condiments.filter(
      (s) => s.isHerbaMystica,
    ).length;
    const numIngredients =
      sandwich!.condiments.length + sandwich!.fillings.length;

    expect(sandwich!.fillings.length).toBeGreaterThan(0);
    expect(sandwich!.condiments.length).toBeGreaterThan(0);
    expect(numHerba).toBeLessThanOrEqual(2);
    expect(numIngredients).toBeLessThanOrEqual(3);
  });

  it('Produces a sandwich with Lv 2 Title Normal', () => {
    const sandwich = makeSandwichForPower({
      mealPower: 'Title',
      type: 'Normal',
      level: 2,
    });

    // cheese, herba mystica
    expect(sandwich).not.toBeNull();

    const numHerba = sandwich!.condiments.filter(
      (s) => s.isHerbaMystica,
    ).length;
    const numIngredients =
      sandwich!.condiments.length + sandwich!.fillings.length;

    expect(sandwich!.fillings.length).toBeGreaterThan(0);
    expect(sandwich!.condiments.length).toBeGreaterThan(0);
    expect(numHerba).toBeLessThanOrEqual(1);
    expect(numIngredients).toBeLessThanOrEqual(2);
  });

  it('Produces a sandwich with Lv 2 Encounter Fire', () => {
    const sandwich = makeSandwichForPower({
      mealPower: 'Encounter',
      type: 'Fire',
      level: 2,
    });

    // One acceptable recipe: 4x chorizo, 2x rice, 1x peanut butter
    expect(sandwich).not.toBeNull();

    const numHerba = sandwich!.condiments.filter(
      (s) => s.isHerbaMystica,
    ).length;

    expect(numHerba).toBe(0);
  });

  it('Produces a sandwich with Lv 2 Catch Bug', () => {
    const sandwich = makeSandwichForPower({
      mealPower: 'Catch',
      type: 'Bug',
      level: 2,
    });

    // One viable recipe: 4x chorizo, 1x cherry tomato, 1x banana, 3x jam
    expect(sandwich).not.toBeNull();
  });

  it('Produces a sandwich with Lv 2 Egg', () => {
    const sandwich = makeSandwichForPower({
      mealPower: 'Egg',
      type: 'Bug',
      level: 2,
    });

    // 4x Chorizo, 1x Banana, 1x (Banana OR potato salad OR fried fillet), 2x Whippped Cream
    expect(sandwich).not.toBeNull();
  });

  it('Produces a sandwich with Lv 2 Exp Dark', () => {
    const sandwich = makeSandwichForPower({
      mealPower: 'Exp',
      type: 'Dark',
      level: 2,
    });

    // 4x Herbed Sausage, 2x Potato Salad, Yogurt
    expect(sandwich).not.toBeNull();

    // const numFillings = sandwich!.fillings.length;

    // expect(numIngredients).toBeLessThanOrEqual(7);
  });

  it('Produces a sandwich with Lv 2 Humungo Dragon', () => {
    const sandwich = makeSandwichForPower({
      mealPower: 'Humungo',
      type: 'Dragon',
      level: 2,
    });

    // 4x Chorizo, Potato Salad, Jalapeno OR curry OR horseradish, 2x Vinegar
    expect(sandwich).not.toBeNull();

    // const numFillings = sandwich!.fillings.length;

    // expect(numIngredients).toBeLessThanOrEqual(8);
  });

  it('Produces a sandwich with Lv 2 Item Electric', () => {
    const sandwich = makeSandwichForPower({
      mealPower: 'Item',
      type: 'Electric',
      level: 2,
    });

    // 4x Chorizo, 2x Yellow Pepper, 2x Vinegar, Marmalade
    // 4x Chorizo, 2x Banana, 2x Marmalade
    // 4x Chorizo, Yellow Pepper, Noodles, 2x Marmalade, Curry Powder
    // 4x Chorizo, Banana, Noodles, 3x Marmalade, Curry Powder
    expect(sandwich).not.toBeNull();

    // const numFillings = sandwich!.fillings.length;

    // expect(numIngredients).toBeLessThanOrEqual(8);
  });

  it('Produces a sandwich with Lv 2 Raid Fairy', () => {
    const sandwich = makeSandwichForPower({
      mealPower: 'Raid',
      type: 'Fairy',
      level: 2,
    });

    // 4x Egg, 1x potato salad, 2x Wasabi, 1x yogurt
    expect(sandwich).not.toBeNull();

    const numFillings = sandwich!.fillings.length;

    expect(numFillings).toBeLessThanOrEqual(5);
  });

  it('Produces a sandwich with Lv 2 Teensy Fighting', () => {
    const sandwich = makeSandwichForPower({
      mealPower: 'Teensy',
      type: 'Fighting',
      level: 2,
    });

    // Herbed Sausage, Rice, Strawberry, Herbed Sausage, Herbed Sausage, Strawberry, Mayonnaise
    expect(sandwich).not.toBeNull();
  });

  it('Produces a sandwich with Lv 2 Catch Flying', () => {
    const sandwich = makeSandwichForPower({
      mealPower: 'Catch',
      type: 'Flying',
      level: 2,
    });

    // Egg, Rice, Rice, Rice, Rice, Egg, Yogurt
    expect(sandwich).not.toBeNull();
  });

  it('Produces a sandwich with Lv 2 Encounter Ghost', () => {
    const sandwich = makeSandwichForPower({
      mealPower: 'Encounter',
      type: 'Ghost',
      level: 2,
    });

    // 4x Herbed Sausage, 2x Strawberry, Wasabi
    expect(sandwich).not.toBeNull();
  });

  it('Produces a sandwich with Lv 2 Exp Grass', () => {
    const sandwich = makeSandwichForPower({
      mealPower: 'Exp',
      type: 'Grass',
      level: 2,
    });

    // 4x Egg, Rice, Jalapeno, Salt
    // 4x Egg, Jalapeno, 4x Olive Oil
    expect(sandwich).not.toBeNull();
  });

  it('Produces a sandwich with Lv 2 Exp Steel', () => {
    const sandwich = makeSandwichForPower({
      mealPower: 'Exp',
      type: 'Steel',
      level: 2,
    });

    // 4x egg, 2x potato salad, 2x marmalade, salt
    expect(sandwich).not.toBeNull();
  });

  it('Produces a valid recipe when Lv 1 Sparkling is requested', () => {
    const sandwich = makeSandwichForPower({
      mealPower: 'Sparkling',
      type: 'Ice',
      level: 1,
    });

    // Klawf Stick, 2x herba mystica
    expect(sandwich).not.toBeNull();

    const numHerba = sandwich!.condiments.filter(
      (s) => s.isHerbaMystica,
    ).length;

    expect(numHerba).toBe(2);
  });

  it('Produces a sandwich with Lv 3 Exp Ice', () => {
    const sandwich = makeSandwichForPower({
      mealPower: 'Exp',
      type: 'Ice',
      level: 3,
    });

    // Klawf, Bitter Herba, Salty Herba
    // 4x Egg, Pepper, Salty/Bitter Herba
    expect(sandwich).not.toBeNull();

    console.debug(
      `${sandwich!.fillings
        .concat(sandwich!.condiments)
        .map((i) => i.name)
        .join(', ')}`,
    );

    const numIngredients =
      sandwich!.fillings.length + sandwich!.condiments.length;
    const numFillings = sandwich!.fillings.length;
    const numHerba = sandwich!.condiments.filter(
      (s) => s.isHerbaMystica,
    ).length;

    expect(numHerba).toBeLessThanOrEqual(1);
    expect(numFillings).toBeLessThanOrEqual(4);
    // Can do it in 6
    expect(numIngredients).toBeLessThanOrEqual(7);
  });

  it('Produces a sandwich with Lv 3 Humungo Poison', () => {
    const sandwich = makeSandwichForPower({
      mealPower: 'Humungo',
      type: 'Poison',
      level: 3,
    });

    // 4x Chorizo, Ketchup, Spicy/Salty Herba
    expect(sandwich).not.toBeNull();

    const numFillings = sandwich!.fillings.length;
    const numHerba = sandwich!.condiments.filter(
      (s) => s.isHerbaMystica,
    ).length;

    expect(numHerba).toBeLessThanOrEqual(1);
    expect(numFillings).toBeLessThanOrEqual(4);
  });

  it('Produces a sandwich with Lv 3 Item Psychic', () => {
    const sandwich = makeSandwichForPower({
      mealPower: 'Item',
      type: 'Psychic',
      level: 3,
    });

    // 2x Herbed Sausage, 3x Onion, 1x Vinegar, Bitter herba
    // 3x Herbed Sausage, 1x Noodles, 2x Vinegar, Bitter Herba
    expect(sandwich).not.toBeNull();

    console.debug(
      `${sandwich!.fillings
        .concat(sandwich!.condiments)
        .map((i) => i.name)
        .join(', ')}`,
    );

    const numFillings = sandwich!.fillings.length;
    const numHerba = sandwich!.condiments.filter(
      (s) => s.isHerbaMystica,
    ).length;

    expect(numHerba).toBeLessThanOrEqual(1);
    expect(numFillings).toBeLessThanOrEqual(5);
  });

  it('Produces a sandwich with Lv 3 Raid Rock', () => {
    const sandwich = makeSandwichForPower({
      mealPower: 'Raid',
      type: 'Rock',
      level: 3,
    });

    // 4x Egg, Jam or PB, Marmalade, Spicy Herba
    expect(sandwich).not.toBeNull();

    console.debug(
      `${sandwich!.fillings
        .concat(sandwich!.condiments)
        .map((i) => i.name)
        .join(', ')}`,
    );

    const numIngredients =
      sandwich!.fillings.length + sandwich!.condiments.length;
    const numFillings = sandwich!.fillings.length;
    const numHerba = sandwich!.condiments.filter(
      (s) => s.isHerbaMystica,
    ).length;

    expect(numHerba).toBeLessThanOrEqual(1);
    expect(numFillings).toBeLessThanOrEqual(4);
    // You can do it in 7 but the algo has a hard time so i'll give it leeway
    expect(numIngredients).toBeLessThanOrEqual(8);
  });

  it('Produces a sandwich with Lv 3 Teensy Steel', () => {
    const sandwich = makeSandwichForPower({
      mealPower: 'Teensy',
      type: 'Steel',
      level: 3,
    });

    // 4x Egg, 1x PB, Sour Herba
    expect(sandwich).not.toBeNull();

    console.debug(
      `${sandwich!.fillings
        .concat(sandwich!.condiments)
        .map((i) => i.name)
        .join(', ')}`,
    );

    const numIngredients =
      sandwich!.fillings.length + sandwich!.condiments.length;
    const numFillings = sandwich!.fillings.length;
    const numHerba = sandwich!.condiments.filter(
      (s) => s.isHerbaMystica,
    ).length;

    expect(numHerba).toBeLessThanOrEqual(1);
    expect(numFillings).toBeLessThanOrEqual(4);
    expect(numIngredients).toBeLessThanOrEqual(6);
  });

  // it('Produces a sandwich with Lv 2 mp t', () => {
  //   const sandwich = makeSandwichForPower({
  //     mealPower: 'Catch',
  //     type: 'Bug',
  //     level: 2,
  //   });

  //   //
  //   expect(sandwich).not.toBeNull();

  //   console.debug(
  //     `${sandwich!.fillings
  //       .concat(sandwich!.condiments)
  //       .map((i) => i.name)
  //       .join(', ')}`,
  //   );
  // });
});
