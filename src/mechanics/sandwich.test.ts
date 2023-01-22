import { MealPower, TypeIndex } from '../enum';
import {
  getMpScoreWeight,
  getTypeScoreWeight,
  makeSandwichForPowers,
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
    const sandwich = makeSandwichForPowers([
      {
        mealPower: MealPower.SPARKLING,
        type: TypeIndex.GROUND,
        level: 3,
      },
    ]);

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
    const sandwich = makeSandwichForPowers([
      {
        mealPower: MealPower.TITLE,
        type: TypeIndex.NORMAL,
        level: 2,
      },
    ]);

    // cheese OR rice, herba mystica
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
    const sandwich = makeSandwichForPowers([
      {
        mealPower: MealPower.ENCOUNTER,
        type: TypeIndex.FIRE,
        level: 2,
      },
    ]);

    // One acceptable recipe: 4x chorizo, 2x rice, 1x peanut butter
    expect(sandwich).not.toBeNull();

    const numHerba = sandwich!.condiments.filter(
      (s) => s.isHerbaMystica,
    ).length;

    expect(numHerba).toBe(0);
  });

  it('Produces a sandwich with Lv 2 Catch Bug', () => {
    const sandwich = makeSandwichForPowers([
      {
        mealPower: MealPower.CATCH,
        type: TypeIndex.BUG,
        level: 2,
      },
    ]);

    // One viable recipe: 4x chorizo, 1x cherry tomato, 1x banana, 3x jam
    expect(sandwich).not.toBeNull();
  });

  it('Produces a sandwich with Lv 2 Egg', () => {
    const sandwich = makeSandwichForPowers([
      {
        mealPower: MealPower.EGG,
        type: TypeIndex.BUG,
        level: 2,
      },
    ]);

    // 4x Chorizo, 1x Banana, 1x (Banana OR potato salad OR fried fillet), 2x Whippped Cream
    expect(sandwich).not.toBeNull();
  });

  it('Produces a sandwich with Lv 2 Exp Dark', () => {
    const sandwich = makeSandwichForPowers([
      {
        mealPower: MealPower.EXP,
        type: TypeIndex.DARK,
        level: 2,
      },
    ]);

    // 4x Herbed Sausage, 2x Potato Salad, Yogurt
    expect(sandwich).not.toBeNull();

    // const numFillings = sandwich!.fillings.length;

    // expect(numIngredients).toBeLessThanOrEqual(7);
  });

  it('Produces a sandwich with Lv 2 Humungo Dragon', () => {
    const sandwich = makeSandwichForPowers([
      {
        mealPower: MealPower.HUMUNGO,
        type: TypeIndex.DRAGON,
        level: 2,
      },
    ]);

    // 4x Chorizo, Potato Salad, Jalapeno OR curry OR horseradish, 2x Vinegar
    expect(sandwich).not.toBeNull();

    // const numFillings = sandwich!.fillings.length;

    // expect(numIngredients).toBeLessThanOrEqual(8);
  });

  it('Produces a sandwich with Lv 2 Item Electric', () => {
    const sandwich = makeSandwichForPowers([
      {
        mealPower: MealPower.ITEM,
        type: TypeIndex.ELECTRIC,
        level: 2,
      },
    ]);

    // 4x Chorizo, 2x Yellow Pepper, 2x Vinegar, Marmalade
    // 4x Chorizo, 2x Banana, 2x Marmalade
    // 4x Chorizo, Yellow Pepper, Noodles, 2x Marmalade, Curry Powder
    // 4x Chorizo, Banana, Noodles, 3x Marmalade, Curry Powder
    expect(sandwich).not.toBeNull();

    // const numFillings = sandwich!.fillings.length;

    // expect(numIngredients).toBeLessThanOrEqual(8);
  });

  it('Produces a sandwich with Lv 2 Raid Fairy', () => {
    const sandwich = makeSandwichForPowers([
      {
        mealPower: MealPower.RAID,
        type: TypeIndex.FAIRY,
        level: 2,
      },
    ]);

    // 4x Egg, 1x potato salad, 2x Wasabi, 1x yogurt
    expect(sandwich).not.toBeNull();

    const numFillings = sandwich!.fillings.length;

    expect(numFillings).toBeLessThanOrEqual(5);
  });

  it('Produces a sandwich with Lv 2 Teensy Fighting', () => {
    const sandwich = makeSandwichForPowers([
      {
        mealPower: MealPower.TEENSY,
        type: TypeIndex.FIGHTING,
        level: 2,
      },
    ]);

    // Herbed Sausage, Rice, Strawberry, Herbed Sausage, Herbed Sausage, Strawberry, Mayonnaise
    expect(sandwich).not.toBeNull();
  });

  it('Produces a sandwich with Lv 2 Catch Flying', () => {
    const sandwich = makeSandwichForPowers([
      {
        mealPower: MealPower.CATCH,
        type: TypeIndex.FLYING,
        level: 2,
      },
    ]);

    // Egg, Rice, Rice, Rice, Rice, Egg, Yogurt
    expect(sandwich).not.toBeNull();
  });

  it('Produces a sandwich with Lv 2 Encounter Ghost', () => {
    const sandwich = makeSandwichForPowers([
      {
        mealPower: MealPower.ENCOUNTER,
        type: TypeIndex.GHOST,
        level: 2,
      },
    ]);

    // 4x Herbed Sausage, 2x Strawberry, Wasabi
    expect(sandwich).not.toBeNull();
  });

  it('Produces a sandwich with Lv 2 Exp Grass', () => {
    const sandwich = makeSandwichForPowers([
      {
        mealPower: MealPower.EXP,
        type: TypeIndex.GRASS,
        level: 2,
      },
    ]);

    // 4x Egg, Rice, Jalapeno, Salt
    // 4x Egg, Jalapeno, 4x Olive Oil
    expect(sandwich).not.toBeNull();
  });

  it('Produces a sandwich with Lv 2 Exp Steel', () => {
    const sandwich = makeSandwichForPowers([
      {
        mealPower: MealPower.EXP,
        type: TypeIndex.STEEL,
        level: 2,
      },
    ]);

    // 4x egg, 2x potato salad, 2x marmalade, salt
    expect(sandwich).not.toBeNull();
  });

  it('Produces a valid recipe when Lv 1 Sparkling is requested', () => {
    const sandwich = makeSandwichForPowers([
      {
        mealPower: MealPower.SPARKLING,
        type: TypeIndex.ICE,
        level: 1,
      },
    ]);

    // Klawf Stick, 2x herba mystica
    expect(sandwich).not.toBeNull();

    const numHerba = sandwich!.condiments.filter(
      (s) => s.isHerbaMystica,
    ).length;

    expect(numHerba).toBe(2);
  });

  it('Produces a sandwich with Lv 3 Exp Ice', () => {
    const sandwich = makeSandwichForPowers([
      {
        mealPower: MealPower.EXP,
        type: TypeIndex.ICE,
        level: 3,
      },
    ]);

    // Klawf, Bitter Herba, Salty Herba
    // 4x Egg, Pepper, Salty/Bitter Herba
    // 4x Egg, Pepper, Salt, Spicy Herba Mystica
    expect(sandwich).not.toBeNull();

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
    const sandwich = makeSandwichForPowers([
      {
        mealPower: MealPower.HUMUNGO,
        type: TypeIndex.POISON,
        level: 3,
      },
    ]);

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
    const sandwich = makeSandwichForPowers([
      {
        mealPower: MealPower.ITEM,
        type: TypeIndex.PSYCHIC,
        level: 3,
      },
    ]);

    // 2x Herbed Sausage, 3x Onion, 1x Vinegar, Bitter herba
    // 3x Herbed Sausage, 1x Noodles, 2x Vinegar, Bitter Herba
    expect(sandwich).not.toBeNull();

    const numFillings = sandwich!.fillings.length;
    const numHerba = sandwich!.condiments.filter(
      (s) => s.isHerbaMystica,
    ).length;

    expect(numHerba).toBeLessThanOrEqual(1);
    expect(numFillings).toBeLessThanOrEqual(5);
  });

  it('Produces a sandwich with Lv 3 Raid Rock', () => {
    const sandwich = makeSandwichForPowers([
      {
        mealPower: MealPower.RAID,
        type: TypeIndex.ROCK,
        level: 3,
      },
    ]);

    // 4x Egg, Jam or PB, Marmalade, Spicy Herba
    expect(sandwich).not.toBeNull();

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
    const sandwich = makeSandwichForPowers([
      {
        mealPower: MealPower.TEENSY,
        type: TypeIndex.STEEL,
        level: 3,
      },
    ]);

    // 4x Egg, 1x PB, Sour Herba
    expect(sandwich).not.toBeNull();

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
  it('Produces a sandwich with Lv 3 Catch Water', () => {
    const sandwich = makeSandwichForPowers([
      {
        mealPower: MealPower.CATCH,
        type: TypeIndex.WATER,
        level: 3,
      },
    ]);

    // 2x Herbed Sausage, 2x Rice, Cream Cheese, Chili Sauce OR jam, curry powder, sour herba
    expect(sandwich).not.toBeNull();

    const numIngredients =
      sandwich!.fillings.length + sandwich!.condiments.length;
    const numFillings = sandwich!.fillings.length;
    const numHerba = sandwich!.condiments.filter(
      (s) => s.isHerbaMystica,
    ).length;

    expect(numHerba).toBeLessThanOrEqual(1);
    expect(numFillings).toBeLessThanOrEqual(4);
    expect(numIngredients).toBeLessThanOrEqual(7);
  });

  it('Produces a sandwich with Lv 3 Egg', () => {
    const sandwich = makeSandwichForPowers([
      {
        mealPower: MealPower.EGG,
        type: TypeIndex.NORMAL,
        level: 3,
      },
    ]);

    //
    expect(sandwich).not.toBeNull();

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
  it('Produces a sandwich with Lv 3 Encounter Bug', () => {
    const sandwich = makeSandwichForPowers([
      {
        mealPower: MealPower.ENCOUNTER,
        type: TypeIndex.BUG,
        level: 3,
      },
    ]);

    //
    expect(sandwich).not.toBeNull();

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

  it('Produces a sandwich with Lv 1 Egg and Lv 2 Catch Dark', () => {
    const sandwich = makeSandwichForPowers([
      {
        mealPower: MealPower.EGG,
        type: 0,
        level: 1,
      },
      {
        mealPower: MealPower.CATCH,
        type: TypeIndex.DARK,
        level: 2,
      },
    ]);

    // 2x Smoked Fillet, 4x Watercress, 3x vinegar, Sweet Herba
    // 2x Fried Fillet, Herbed Sausage, Rice, Sweet Herba
    expect(sandwich).not.toBeNull();

    const numHerba = sandwich!.condiments.filter(
      (s) => s.isHerbaMystica,
    ).length;
    expect(numHerba).toBeLessThanOrEqual(1);
  });

  // Non-constructible:
  // Lv 1 Exp Dragon, Lv 1 Item Fighting, and Lv 1 Humungo Electric
  // Lv 1 Item Fire, Lv 1 Raid Fairy, and Lv 1 Teensy Flying

  it('Produces a sandwich with Lv 1 Exp Dragon, Lv 1 Item Fighting, and Lv 1 Encounter Electric', () => {
    const sandwich = makeSandwichForPowers([
      {
        mealPower: MealPower.EXP,
        type: TypeIndex.DRAGON,
        level: 1,
      },
      {
        mealPower: MealPower.ITEM,
        type: TypeIndex.FIGHTING,
        level: 1,
      },
      {
        mealPower: MealPower.ENCOUNTER,
        type: TypeIndex.ELECTRIC,
        level: 1,
      },
    ]);

    // Chorizo, Herbed Sausage, pickle, yellow bell pepper, Avocado, marmalade, pepper
    // 2x Chorizo, Strawberry, Ham, Pickle, Herbed Sausage, Pepper, 2x Jam
    expect(sandwich).not.toBeNull();

    const numIngredients =
      sandwich!.fillings.length + sandwich!.condiments.length;
    const numHerba = sandwich!.condiments.filter(
      (s) => s.isHerbaMystica,
    ).length;

    expect(numHerba).toBe(0);
    expect(numIngredients).toBeLessThanOrEqual(9);
  });

  it('Produces a sandwich with Lv 1 Item Fire, Lv 1 Raid Fairy, and Lv 1 Catch Ghost', () => {
    const sandwich = makeSandwichForPowers([
      {
        mealPower: MealPower.ITEM,
        type: TypeIndex.FIRE,
        level: 1,
      },
      {
        mealPower: MealPower.RAID,
        type: TypeIndex.FAIRY,
        level: 1,
      },
      {
        mealPower: MealPower.CATCH,
        type: TypeIndex.GHOST,
        level: 1,
      },
    ]);

    // 3x Potato Tortilla, Banana, Tomato, Red Bell Pepper, Olive Oil, Salt, Curry Powder, Pepper
    expect(sandwich).not.toBeNull();
    console.debug(
      `${sandwich!.fillings
        .concat(sandwich!.condiments)
        .map((i) => i.name)
        .join(', ')}`,
    );

    const numIngredients =
      sandwich!.fillings.length + sandwich!.condiments.length;
    const numHerba = sandwich!.condiments.filter(
      (s) => s.isHerbaMystica,
    ).length;

    expect(numHerba).toBe(0);
  });

  // it('Produces a sandwich with Lv 2 mp t', () => {
  //   const sandwich = makeSandwichForPowers([{
  //     mealPower: MealPower.CATCH,
  //     type: TypeIndex.BUG,
  //     level: 2,
  //   }]);

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
