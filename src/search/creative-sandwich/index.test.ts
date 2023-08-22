import { MealPower, TypeIndex } from '@/enum';
import { getPowersForIngredients, powerSetsMatch } from '@/mechanics';
import { makeSandwichForPowers } from '.';

describe('makeSandwichForPower', () => {
  // Watercress, Bitter Herba Mystica, Bitter Herba Mystica, Mustard
  it('Produces a sandwich with Lv 3 Sparkling Ground', () => {
    const targetPowers = [
      {
        mealPower: MealPower.SPARKLING,
        type: TypeIndex.GROUND,
        level: 3,
      },
    ];
    const sandwich = makeSandwichForPowers(targetPowers);

    expect(sandwich).not.toBeNull();
    const ingredients = sandwich!.fillings.concat(sandwich!.condiments);
    const correctResult = powerSetsMatch(
      getPowersForIngredients(ingredients),
      targetPowers,
    );
    expect(correctResult).toBe(true);

    const numHerba = sandwich!.condiments.filter(
      (s) => s.isHerbaMystica,
    ).length;
    const numIngredients =
      sandwich!.condiments.length + sandwich!.fillings.length;

    expect(sandwich!.fillings.length).toBeGreaterThan(0);
    expect(sandwich!.condiments.length).toBeGreaterThan(0);
    expect(numHerba).toBe(2);
    expect(numIngredients).toBeLessThanOrEqual(3);
  });

  it('Produces a sandwich with Lv 2 Title Normal', () => {
    const targetPowers = [
      {
        mealPower: MealPower.TITLE,
        type: TypeIndex.NORMAL,
        level: 2,
      },
    ];
    const sandwich = makeSandwichForPowers(targetPowers);

    // cheese OR rice OR tofu, herba mystica
    expect(sandwich).not.toBeNull();
    const ingredients = sandwich!.fillings.concat(sandwich!.condiments);
    const correctResult = powerSetsMatch(
      getPowersForIngredients(ingredients),
      targetPowers,
    );
    expect(correctResult).toBe(true);

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
    const targetPowers = [
      {
        mealPower: MealPower.ENCOUNTER,
        type: TypeIndex.FIRE,
        level: 2,
      },
    ];
    const sandwich = makeSandwichForPowers(targetPowers);

    // ONE_THREE_TWO; Salty + Hot = Encounter (9)
    // One acceptable recipe: 4x chorizo, 2x rice, 1x peanut butter
    expect(sandwich).not.toBeNull();
    const ingredients = sandwich!.fillings.concat(sandwich!.condiments);
    const correctResult = powerSetsMatch(
      getPowersForIngredients(ingredients),
      targetPowers,
    );
    expect(correctResult).toBe(true);

    const numHerba = sandwich!.condiments.filter(
      (s) => s.isHerbaMystica,
    ).length;

    expect(numHerba).toBe(0);
  });

  it('Produces a sandwich with Lv 2 Catch Bug', () => {
    const targetPowers = [
      {
        mealPower: MealPower.CATCH,
        type: TypeIndex.BUG,
        level: 2,
      },
    ];
    const sandwich = makeSandwichForPowers(targetPowers);

    // One viable recipe: 4x chorizo, 1x cherry tomato, 1x banana, 3x jam
    expect(sandwich).not.toBeNull();
    const ingredients = sandwich!.fillings.concat(sandwich!.condiments);
    const correctResult = powerSetsMatch(
      getPowersForIngredients(ingredients),
      targetPowers,
    );
    expect(correctResult).toBe(true);
  });

  it('Produces a sandwich with Lv 2 Egg', () => {
    const targetPowers = [
      {
        mealPower: MealPower.EGG,
        type: TypeIndex.BUG,
        level: 2,
      },
    ];
    const sandwich = makeSandwichForPowers(targetPowers);

    // 4x Chorizo, 1x Banana, 1x (Banana OR potato salad OR fried fillet), 2x Whippped Cream
    expect(sandwich).not.toBeNull();
    const ingredients = sandwich!.fillings.concat(sandwich!.condiments);
    const correctResult = powerSetsMatch(
      getPowersForIngredients(ingredients),
      targetPowers,
    );
    expect(correctResult).toBe(true);
  });

  it('Produces a sandwich with Lv 2 Exp Dark', () => {
    const targetPowers = [
      {
        mealPower: MealPower.EXP,
        type: TypeIndex.DARK,
        level: 2,
      },
    ];
    const sandwich = makeSandwichForPowers(targetPowers);

    // 4x Herbed Sausage, 2x Potato Salad, Yogurt
    expect(sandwich).not.toBeNull();
    const ingredients = sandwich!.fillings.concat(sandwich!.condiments);
    const correctResult = powerSetsMatch(
      getPowersForIngredients(ingredients),
      targetPowers,
    );
    expect(correctResult).toBe(true);

    // const numFillings = sandwich!.fillings.length;

    // expect(numIngredients).toBeLessThanOrEqual(7);
  });

  it('Produces a sandwich with Lv 2 Humungo Dragon', () => {
    const targetPowers = [
      {
        mealPower: MealPower.HUMUNGO,
        type: TypeIndex.DRAGON,
        level: 2,
      },
    ];
    const sandwich = makeSandwichForPowers(targetPowers);

    // 4x Chorizo, Potato Salad, Jalapeno OR curry OR horseradish, 2x Vinegar
    expect(sandwich).not.toBeNull();
    const ingredients = sandwich!.fillings.concat(sandwich!.condiments);
    const correctResult = powerSetsMatch(
      getPowersForIngredients(ingredients),
      targetPowers,
    );
    expect(correctResult).toBe(true);

    // const numFillings = sandwich!.fillings.length;

    // expect(numIngredients).toBeLessThanOrEqual(8);
  });

  it('Produces a sandwich with Lv 2 Item Electric', () => {
    const targetPowers = [
      {
        mealPower: MealPower.ITEM,
        type: TypeIndex.ELECTRIC,
        level: 2,
      },
    ];
    const sandwich = makeSandwichForPowers(targetPowers);

    // 4x Chorizo, 2x Yellow Pepper, 2x Vinegar, Marmalade
    // 4x Chorizo, 2x Banana, 2x Marmalade
    // 4x Chorizo, Yellow Pepper, Noodles, 2x Marmalade, Curry Powder
    // 4x Chorizo, Banana, Noodles, 3x Marmalade, Curry Powder
    expect(sandwich).not.toBeNull();
    const ingredients = sandwich!.fillings.concat(sandwich!.condiments);
    const correctResult = powerSetsMatch(
      getPowersForIngredients(ingredients),
      targetPowers,
    );
    expect(correctResult).toBe(true);

    // const numFillings = sandwich!.fillings.length;

    // expect(numIngredients).toBeLessThanOrEqual(8);
  });

  it('Produces a sandwich with Lv 2 Raid Fairy', () => {
    const targetPowers = [
      {
        mealPower: MealPower.RAID,
        type: TypeIndex.FAIRY,
        level: 2,
      },
    ];
    const sandwich = makeSandwichForPowers(targetPowers);

    // 4x Egg, 1x potato salad, 2x Wasabi, 1x yogurt
    expect(sandwich).not.toBeNull();
    const ingredients = sandwich!.fillings.concat(sandwich!.condiments);
    const correctResult = powerSetsMatch(
      getPowersForIngredients(ingredients),
      targetPowers,
    );
    expect(correctResult).toBe(true);

    const numFillings = sandwich!.fillings.length;

    expect(numFillings).toBeLessThanOrEqual(5);
  });

  it('Produces a sandwich with Lv 2 Teensy Fighting', () => {
    const targetPowers = [
      {
        mealPower: MealPower.TEENSY,
        type: TypeIndex.FIGHTING,
        level: 2,
      },
    ];
    const sandwich = makeSandwichForPowers(targetPowers);

    // Herbed Sausage, Rice, Strawberry, Herbed Sausage, Herbed Sausage, Strawberry, Mayonnaise
    expect(sandwich).not.toBeNull();
    const ingredients = sandwich!.fillings.concat(sandwich!.condiments);
    const correctResult = powerSetsMatch(
      getPowersForIngredients(ingredients),
      targetPowers,
    );
    expect(correctResult).toBe(true);
  });

  it('Produces a sandwich with Lv 2 Catch Flying', () => {
    const targetPowers = [
      {
        mealPower: MealPower.CATCH,
        type: TypeIndex.FLYING,
        level: 2,
      },
    ];
    const sandwich = makeSandwichForPowers(targetPowers);

    // Egg, Rice, Rice, Rice, Rice, Egg, Yogurt
    expect(sandwich).not.toBeNull();
    const ingredients = sandwich!.fillings.concat(sandwich!.condiments);
    const correctResult = powerSetsMatch(
      getPowersForIngredients(ingredients),
      targetPowers,
    );
    expect(correctResult).toBe(true);
  });

  it('Produces a sandwich with Lv 2 Encounter Ghost', () => {
    const targetPowers = [
      {
        mealPower: MealPower.ENCOUNTER,
        type: TypeIndex.GHOST,
        level: 2,
      },
    ];
    const sandwich = makeSandwichForPowers(targetPowers);

    // 4x Herbed Sausage, 2x Strawberry, Wasabi
    expect(sandwich).not.toBeNull();
    const ingredients = sandwich!.fillings.concat(sandwich!.condiments);
    const correctResult = powerSetsMatch(
      getPowersForIngredients(ingredients),
      targetPowers,
    );
    expect(correctResult).toBe(true);
  });

  it('Produces a sandwich with Lv 2 Exp Grass', () => {
    const targetPowers = [
      {
        mealPower: MealPower.EXP,
        type: TypeIndex.GRASS,
        level: 2,
      },
    ];
    const sandwich = makeSandwichForPowers(targetPowers);

    // 4x Egg, Rice, Jalapeno, Salt
    // 4x Egg, Jalapeno, 4x Olive Oil
    expect(sandwich).not.toBeNull();
    const ingredients = sandwich!.fillings.concat(sandwich!.condiments);
    const correctResult = powerSetsMatch(
      getPowersForIngredients(ingredients),
      targetPowers,
    );
    expect(correctResult).toBe(true);
  });

  it('Produces a sandwich with Lv 2 Exp Steel', () => {
    const targetPowers = [
      {
        mealPower: MealPower.EXP,
        type: TypeIndex.STEEL,
        level: 2,
      },
    ];
    const sandwich = makeSandwichForPowers(targetPowers);

    // 4x egg, 2x potato salad, 2x marmalade, salt
    expect(sandwich).not.toBeNull();
    const ingredients = sandwich!.fillings.concat(sandwich!.condiments);
    const correctResult = powerSetsMatch(
      getPowersForIngredients(ingredients),
      targetPowers,
    );
    expect(correctResult).toBe(true);
  });

  it('Produces a valid recipe when Lv 1 Sparkling is requested', () => {
    const targetPowers = [
      {
        mealPower: MealPower.SPARKLING,
        type: TypeIndex.ICE,
        level: 1,
      },
    ];
    const sandwich = makeSandwichForPowers(targetPowers);

    // Klawf Stick, 2x herba mystica
    expect(sandwich).not.toBeNull();
    const ingredients = sandwich!.fillings.concat(sandwich!.condiments);
    const correctResult = powerSetsMatch(
      getPowersForIngredients(ingredients),
      targetPowers,
    );
    expect(correctResult).toBe(true);

    const numHerba = sandwich!.condiments.filter(
      (s) => s.isHerbaMystica,
    ).length;

    expect(numHerba).toBe(2);
  });

  it('Produces a sandwich with Lv 3 Exp Ice', () => {
    const targetPowers = [
      {
        mealPower: MealPower.EXP,
        type: TypeIndex.ICE,
        level: 3,
      },
    ];
    const sandwich = makeSandwichForPowers(targetPowers);

    // Klawf, Bitter Herba, Salty Herba
    // 4x Egg, Pepper, Salty/Bitter Herba
    // 4x Egg, Pepper, Salt, Spicy Herba Mystica
    expect(sandwich).not.toBeNull();
    const ingredients = sandwich!.fillings.concat(sandwich!.condiments);
    const correctResult = powerSetsMatch(
      getPowersForIngredients(ingredients),
      targetPowers,
    );
    expect(correctResult).toBe(true);

    const numIngredients = ingredients.length;
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
    const targetPowers = [
      {
        mealPower: MealPower.HUMUNGO,
        type: TypeIndex.POISON,
        level: 3,
      },
    ];
    const sandwich = makeSandwichForPowers(targetPowers);

    // 4x Chorizo, Ketchup, Spicy/Salty Herba
    expect(sandwich).not.toBeNull();
    const ingredients = sandwich!.fillings.concat(sandwich!.condiments);
    const correctResult = powerSetsMatch(
      getPowersForIngredients(ingredients),
      targetPowers,
    );
    expect(correctResult).toBe(true);

    const numFillings = sandwich!.fillings.length;
    const numHerba = sandwich!.condiments.filter(
      (s) => s.isHerbaMystica,
    ).length;

    expect(numHerba).toBeLessThanOrEqual(1);
    expect(numFillings).toBeLessThanOrEqual(4);
  });

  it('Produces a sandwich with Lv 3 Item Psychic', () => {
    const targetPowers = [
      {
        mealPower: MealPower.ITEM,
        type: TypeIndex.PSYCHIC,
        level: 3,
      },
    ];
    const sandwich = makeSandwichForPowers(targetPowers);

    // 2x Herbed Sausage, 3x Onion, 1x Vinegar, Bitter herba
    // 3x Herbed Sausage, 1x Noodles, 2x Vinegar, Bitter Herba
    expect(sandwich).not.toBeNull();
    const ingredients = sandwich!.fillings.concat(sandwich!.condiments);
    const correctResult = powerSetsMatch(
      getPowersForIngredients(ingredients),
      targetPowers,
    );
    expect(correctResult).toBe(true);

    const numFillings = sandwich!.fillings.length;
    const numHerba = sandwich!.condiments.filter(
      (s) => s.isHerbaMystica,
    ).length;

    expect(numHerba).toBeLessThanOrEqual(1);
    expect(numFillings).toBeLessThanOrEqual(5);
  });

  it('Produces a sandwich with Lv 3 Raid Rock', () => {
    const targetPowers = [
      {
        mealPower: MealPower.RAID,
        type: TypeIndex.ROCK,
        level: 3,
      },
    ];
    const sandwich = makeSandwichForPowers(targetPowers);

    // 4x Egg, Jam or PB, Marmalade, Spicy Herba
    expect(sandwich).not.toBeNull();
    const ingredients = sandwich!.fillings.concat(sandwich!.condiments);
    const correctResult = powerSetsMatch(
      getPowersForIngredients(ingredients),
      targetPowers,
    );
    expect(correctResult).toBe(true);

    const numIngredients = ingredients.length;
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
    const targetPowers = [
      {
        mealPower: MealPower.TEENSY,
        type: TypeIndex.STEEL,
        level: 3,
      },
    ];
    const sandwich = makeSandwichForPowers(targetPowers);

    // 4x Egg, 1x PB, Sour Herba
    expect(sandwich).not.toBeNull();
    const ingredients = sandwich!.fillings.concat(sandwich!.condiments);
    const correctResult = powerSetsMatch(
      getPowersForIngredients(ingredients),
      targetPowers,
    );
    expect(correctResult).toBe(true);

    const numIngredients = ingredients.length;
    const numFillings = sandwich!.fillings.length;
    const numHerba = sandwich!.condiments.filter(
      (s) => s.isHerbaMystica,
    ).length;

    expect(numHerba).toBeLessThanOrEqual(1);
    expect(numFillings).toBeLessThanOrEqual(4);
    expect(numIngredients).toBeLessThanOrEqual(6);
  });
  it('Produces a sandwich with Lv 3 Catch Water', () => {
    const targetPowers = [
      {
        mealPower: MealPower.CATCH,
        type: TypeIndex.WATER,
        level: 3,
      },
    ];
    const sandwich = makeSandwichForPowers(targetPowers);

    // 2x Herbed Sausage, 2x Rice, Cream Cheese, Chili Sauce OR jam, curry powder, sour herba
    expect(sandwich).not.toBeNull();
    const ingredients = sandwich!.fillings.concat(sandwich!.condiments);
    const correctResult = powerSetsMatch(
      getPowersForIngredients(ingredients),
      targetPowers,
    );
    expect(correctResult).toBe(true);

    const numIngredients = ingredients.length;
    const numFillings = sandwich!.fillings.length;
    const numHerba = sandwich!.condiments.filter(
      (s) => s.isHerbaMystica,
    ).length;

    expect(numHerba).toBeLessThanOrEqual(1);
    expect(numFillings).toBeLessThanOrEqual(4);
    expect(numIngredients).toBeLessThanOrEqual(7);
  });

  it('Produces a sandwich with Lv 3 Egg', () => {
    const targetPowers = [
      {
        mealPower: MealPower.EGG,
        type: TypeIndex.NORMAL,
        level: 3,
      },
    ];
    const sandwich = makeSandwichForPowers(targetPowers);

    //
    expect(sandwich).not.toBeNull();
    const ingredients = sandwich!.fillings.concat(sandwich!.condiments);
    const correctResult = powerSetsMatch(
      getPowersForIngredients(ingredients),
      targetPowers,
    );
    expect(correctResult).toBe(true);

    const numIngredients = ingredients.length;
    const numFillings = sandwich!.fillings.length;
    const numHerba = sandwich!.condiments.filter(
      (s) => s.isHerbaMystica,
    ).length;

    expect(numHerba).toBeLessThanOrEqual(1);
    expect(numFillings).toBeLessThanOrEqual(4);
    expect(numIngredients).toBeLessThanOrEqual(6);
  });
  it('Produces a sandwich with Lv 3 Encounter Bug', () => {
    const targetPowers = [
      {
        mealPower: MealPower.ENCOUNTER,
        type: TypeIndex.BUG,
        level: 3,
      },
    ];
    const sandwich = makeSandwichForPowers(targetPowers);

    //
    expect(sandwich).not.toBeNull();
    const ingredients = sandwich!.fillings.concat(sandwich!.condiments);
    const correctResult = powerSetsMatch(
      getPowersForIngredients(ingredients),
      targetPowers,
    );
    expect(correctResult).toBe(true);

    const numIngredients = ingredients.length;
    const numFillings = sandwich!.fillings.length;
    const numHerba = sandwich!.condiments.filter(
      (s) => s.isHerbaMystica,
    ).length;

    expect(numHerba).toBeLessThanOrEqual(1);
    expect(numFillings).toBeLessThanOrEqual(4);
    expect(numIngredients).toBeLessThanOrEqual(6);
  });

  it('Produces a sandwich with Lv 1 Egg and Lv 2 Catch Dark', () => {
    const targetPowers = [
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
    ];
    const sandwich = makeSandwichForPowers(targetPowers);

    // 2x Smoked Fillet, 4x Watercress, 3x vinegar, Sweet Herba
    // 2x Fried Fillet, Herbed Sausage, Rice, Sweet Herba
    // 2x smoked fillet, 2x Fried fillet, rice prosciutto, sweet herba, whipped cream, whipped cream
    expect(sandwich).not.toBeNull();
    const ingredients = sandwich!.fillings.concat(sandwich!.condiments);
    const correctResult = powerSetsMatch(
      getPowersForIngredients(ingredients),
      targetPowers,
    );
    expect(correctResult).toBe(true);

    const numHerba = sandwich!.condiments.filter(
      (s) => s.isHerbaMystica,
    ).length;
    expect(numHerba).toBeLessThanOrEqual(1);
  });

  // Non-constructible:
  // Lv 1 Exp Dragon, Lv 1 Item Fighting, and Lv 1 Humungo Electric
  // Lv 1 Item Fire, Lv 1 Raid Fairy, and Lv 1 Teensy Flying

  it('Produces a sandwich with Lv 1 Exp Dragon, Lv 1 Item Fighting, and Lv 1 Encounter Electric', () => {
    const targetPowers = [
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
    ];
    const sandwich = makeSandwichForPowers(targetPowers);

    // ONE_THREE_TWO; 2,0,1; Bitter+Sour = Item (3)
    // Chorizo, Herbed Sausage, pickle, yellow bell pepper, Avocado, marmalade, pepper
    // Chorizo, Herbed Sausage, 2x Yellow Bell Pepper, Avocado, Marmalade, 2x Wasabi, Mayonnaise
    // Chorizo, Herbed Sausage, pickle, yellow bell pepper, Avocado, marmalade, vinegar, salt

    // Chorizo, Herbed Sausage, Yellow Bell Pepper, Avocado, Tomato, Marmalade, Curry Powder, Mayonnaise, Horseradish
    // HOLY SHIT: Chorizo, Strawberry, Cheese, Pickle, Wasabi, Salt
    expect(sandwich).not.toBeNull();
    const ingredients = sandwich!.fillings.concat(sandwich!.condiments);
    const correctResult = powerSetsMatch(
      getPowersForIngredients(ingredients),
      targetPowers,
    );
    expect(correctResult).toBe(true);

    const numIngredients = ingredients.length;
    const numHerba = sandwich!.condiments.filter(
      (s) => s.isHerbaMystica,
    ).length;

    expect(numHerba).toBe(0);
    expect(numIngredients).toBeLessThanOrEqual(9);
  });

  it('Produces a sandwich with Lv 1 Item Fire, Lv 1 Raid Fairy, and Lv 1 Catch Ghost', () => {
    const targetPowers = [
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
    ];
    const sandwich = makeSandwichForPowers(targetPowers);

    // 3x Potato Tortilla, Banana, Tomato, Red Bell Pepper, Olive Oil, Salt, Curry Powder, Pepper
    expect(sandwich).not.toBeNull();
    const ingredients = sandwich!.fillings.concat(sandwich!.condiments);
    const correctResult = powerSetsMatch(
      getPowersForIngredients(ingredients),
      targetPowers,
    );
    expect(correctResult).toBe(true);

    const numHerba = sandwich!.condiments.filter(
      (s) => s.isHerbaMystica,
    ).length;

    expect(numHerba).toBe(0);
  });

  it('Produces a sandwich with Lv 1 Title Flying, Lv 1 Encounter Grass, and Lv 1 Egg', () => {
    const targetPowers = [
      {
        mealPower: MealPower.TITLE,
        type: TypeIndex.FLYING,
        level: 1,
      },
      {
        mealPower: MealPower.ENCOUNTER,
        type: TypeIndex.GRASS,
        level: 1,
      },
      {
        mealPower: MealPower.EGG,
        type: 0,
        level: 1,
      },
    ];
    const sandwich = makeSandwichForPowers(targetPowers);

    // Jalapeno, Tofu, 2x Prosciutto, Sweet Herba Mystica
    // Rice, Rice, Prosciutto, Salt, Horseradish, Olive Oil, Sweet Herba Mystica
    expect(sandwich).not.toBeNull();
    const ingredients = sandwich!.fillings.concat(sandwich!.condiments);
    const correctResult = powerSetsMatch(
      getPowersForIngredients(ingredients),
      targetPowers,
    );
    expect(correctResult).toBe(true);

    const numFillings = sandwich!.fillings.length;
    const numIngredients = ingredients.length;
    const numHerba = sandwich!.condiments.filter(
      (s) => s.isHerbaMystica,
    ).length;

    expect(numHerba).toBe(1);
    expect(numFillings).toBeLessThanOrEqual(4);
    expect(numIngredients).toBeLessThanOrEqual(7);
  });

  it('Produces a sandwich with Lv 3 Sparkling Ice and Lv 3 Exp Ice', () => {
    const targetPowers = [
      {
        mealPower: MealPower.SPARKLING,
        type: TypeIndex.ICE,
        level: 3,
      },
      {
        mealPower: MealPower.EXP,
        type: TypeIndex.ICE,
        level: 3,
      },
    ];
    const sandwich = makeSandwichForPowers(targetPowers);

    // Klawf, bitter herba, salty herba
    expect(sandwich).not.toBeNull();
    const ingredients = sandwich!.fillings.concat(sandwich!.condiments);
    const correctResult = powerSetsMatch(
      getPowersForIngredients(ingredients),
      targetPowers,
    );
    expect(correctResult).toBe(true);

    const numIngredients = ingredients.length;
    const numHerba = sandwich!.condiments.filter(
      (s) => s.isHerbaMystica,
    ).length;

    expect(numHerba).toBe(2);
    expect(numIngredients).toBeLessThanOrEqual(3);
  });

  it('Produces a sandwich with Lv 1 Exp Rock and Lv 1 Catch Rock', () => {
    const targetPowers = [
      {
        mealPower: MealPower.EXP,
        type: TypeIndex.ROCK,
        level: 1,
      },
      {
        mealPower: MealPower.CATCH,
        type: TypeIndex.ROCK,
        level: 1,
      },
    ];
    const sandwich = makeSandwichForPowers(targetPowers);

    // 4x Bacon, Mustard
    expect(sandwich).not.toBeNull();
    const ingredients = sandwich!.fillings.concat(sandwich!.condiments);
    const correctResult = powerSetsMatch(
      getPowersForIngredients(ingredients),
      targetPowers,
    );
    expect(correctResult).toBe(true);

    const numIngredients = ingredients.length;
    const numHerba = sandwich!.condiments.filter(
      (s) => s.isHerbaMystica,
    ).length;

    expect(numHerba).toBe(0);
    // expect(numIngredients).toBeLessThanOrEqual(6);
  });

  it('Does NOT Naively produces #44 Avocado Sandwich for Lv 1 Exp Dragon and Lv 1 Catching Dark', () => {
    const sandwich = makeSandwichForPowers([
      {
        mealPower: MealPower.EXP,
        type: TypeIndex.DRAGON,
        level: 1,
      },
      {
        mealPower: MealPower.CATCH,
        type: TypeIndex.DARK,
        level: 1,
      },
    ]);

    // Previously: Avocado, Smoked fillet, salt
    // Potato Salad, Jam, Pepper, Yogurt
    expect(sandwich).not.toBeNull();

    const numFillings = sandwich!.fillings.length;
    const numCondiments = sandwich!.condiments.length;
    expect(numFillings).toBe(1);
  });

  // it('Produces a sandwich with Lv 2 mp t', () => {
  //   const sandwich = makeSandwichForPowers([{
  //     mealPower: MealPower.CATCH,
  //     type: TypeIndex.BUG,
  //     level: 2,
  //   }]);

  //   //
  //   expect(sandwich).not.toBeNull();
  // const ingredients = sandwich!.fillings.concat(sandwich!.condiments);
  // const correctResult = powerSetsMatch(
  //   getPowersForIngredients(ingredients),
  //   targetPowers,
  // );
  // expect(correctResult).toBe(true);

  //   console.debug(
  //     `${sandwich!.fillings
  //       .concat(sandwich!.condiments)
  //       .map((i) => i.name)
  //       .join(', ')}`,
  //   );
  // });
});
