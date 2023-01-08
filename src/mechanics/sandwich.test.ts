import {
  getMpScoreWeight,
  getTypeScoreWeight,
  makeSandwichForPower,
} from './sandwich';

const TEST_SET_HERBA = [
  {
    // 1
    recipe: 'Rice-1,Rice-1,Rice-1,Rice-1,Rice-1_Bitter Herba Mystica',
    result: 'Title,Normal,3/Humungo,Normal,3/Item,Flying,3',
  },
  {
    // 2
    recipe: 'Chorizo-1,Rice-1,Rice-1,Rice-1,Rice-1_Bitter Herba Mystica',
    result: 'Title,Normal,3/Item,Normal,3/Humungo,Fighting,2',
  },
  {
    // 3
    recipe: 'Rice-1,Rice-1,Rice-1,Rice-1_Bitter Herba Mystica',
    result: 'Title,Normal,2/Item,Normal,2/Humungo,Flying,2',
  },
  {
    // 4
    recipe: 'Cheese-2,Rice-1,Rice-1,Rice-1,Rice-1_Bitter Herba Mystica',
    result: 'Title,Normal,3/Item,Normal,3/Humungo,Flying,3',
  },
  {
    // 5
    recipe: 'Cheese-1,Rice-1,Rice-1,Rice-1,Rice-1_Bitter Herba Mystica',
    result: 'Title,Normal,2/Item,Normal,2/Humungo,Flying,2',
  },
  {
    // 6
    recipe:
      'Herbed Sausage-3,Herbed Sausage-3,Rice-1,Rice-1_Horseradish,Spicy Herba Mystica',
    result: 'Title,Fighting,3/Humungo,Fighting,3/Encounter,Ground,2',
  },
  {
    // 7
    recipe:
      'Prosciutto-3,Prosciutto-3,Prosciutto-3,Prosciutto-3,Prosciutto-0,Prosciutto-0_Sweet Herba Mystica',
    result: 'Title,Flying,2/Egg,,2/Encounter,Fighting,2',
  },
  {
    // 8
    recipe:
      'Prosciutto-3,Prosciutto-3,Prosciutto-2,Prosciutto-0_Bitter Herba Mystica',
    result: 'Title,Flying,2/Exp,Flying,2/Encounter,Fighting,2',
  },
];

// non-herba
const TEST_SET_NONHERBA = [
  {
    // 1
    recipe:
      'Rice-1,Rice-1,Rice-1,Rice-1,Rice-1,Rice-1_Curry Powder,Curry Powder,Wasabi,Wasabi',
    result: 'Encounter,Fire,2/Humungo,Grass,2/Raid,Water,1',
  },
  {
    // 2
    recipe:
      'Chorizo-3,Chorizo-3,Chorizo-3,Chorizo-3,Rice-1,Rice-1_Curry Powder,Pepper,Wasabi,Wasabi',
    result: 'Humungo,Fire,2/Encounter,Dragon,1/Exp,Normal,1',
  },
  {
    // 3
    recipe:
      'Chorizo-3,Chorizo-3,Chorizo-3,Chorizo-3,Rice-1,Rice-1_Curry Powder,Curry Powder,Wasabi,Wasabi',
    result: 'Humungo,Fire,2/Encounter,Bug,1/Exp,Normal,1',
  },
  {
    // 4
    recipe:
      'Chorizo-3,Chorizo-3,Chorizo-3,Chorizo-3,Potato Salad-1,Rice-1_Curry Powder,Curry Powder,Wasabi,Wasabi',
    result: 'Humungo,Bug,1/Encounter,Dragon,1/Exp,Fire,1',
  },
  {
    // 5
    recipe:
      'Fried Fillet-1,Fried Fillet-1,Fried Fillet-1,Fried Fillet-1,Rice-1,Rice-1_Curry Powder,Curry Powder,Wasabi,Wasabi',
    result: 'Humungo,Water,1/Catch,Flying,1/Teensy,Normal,1',
  },
  {
    // 6
    recipe:
      'Potato Tortilla-1,Potato Tortilla-1,Rice-1,Rice-1,Rice-1,Rice-1_Curry Powder,Curry Powder,Wasabi,Wasabi',
    result: 'Raid,Fire,1/Encounter,Fighting,1/Humungo,Grass,1',
  },
  {
    // 7
    recipe: 'Rice-1,Rice-1,Rice-1,Rice-1,Rice-1,Rice-1_Butter',
    result: 'Humungo,Normal,2/Egg,,2/Encounter,Fighting,1',
  },
  {
    // 8
    recipe: 'Rice-1,Rice-1,Rice-1,Rice-1,Rice-1,Rice-1_Wasabi',
    result: 'Humungo,Normal,2/Raid,Flying,2/Encounter,Fighting,1',
  },
  {
    // 9
    recipe:
      'Rice-1,Rice-1,Rice-1,Rice-1,Rice-1,Rice-1_Salt,Salt,Vinegar,Vinegar',
    result: 'Humungo,Normal,2/Encounter,Flying,2/Teensy,Fighting,1',
  },
  {
    // 10
    recipe:
      'Rice-1,Rice-1,Rice-1,Rice-1,Rice-1,Rice-1_Curry Powder,Curry Powder,Olive Oil,Wasabi',
    result: 'Humungo,Fire,2/Encounter,Water,2/Raid,Grass,1',
  },
  {
    // 11
    recipe:
      'Egg-3,Egg-3,Egg-3,Jalapeno-3,Jalapeno-3,Potato Salad-1_Whipped Cream',
    result: 'Raid,Fairy,2/Exp,Grass,1/Encounter,Rock,1',
  },
  {
    // 12
    recipe:
      'Rice-1,Rice-1,Rice-1,Rice-1,Rice-1,Rice-1_Chili Sauce,Chili Sauce,Cream Cheese',
    result: 'Raid,Water,2/Humungo,Normal,2/Encounter,Grass,1',
  },
  {
    // 13
    recipe:
      'Rice-1,Rice-1,Rice-1,Rice-1,Rice-1,Rice-1_Chili Sauce,Chili Sauce,Olive Oil',
    result: 'Raid,Grass,2/Humungo,Water,2/Encounter,Fire,1',
  },
  {
    // 14
    recipe:
      'Herbed Sausage-3,Herbed Sausage-3,Herbed Sausage-3,Herbed Sausage-3,Potato Tortilla-1,Potato Tortilla-1_Salt,Yogurt,Yogurt,Yogurt',
    result: 'Encounter,Psychic,2/Exp,Ghost,2/Raid,Fighting,1',
  },
  {
    // 15
    recipe:
      'Rice-1,Rice-1,Rice-1,Rice-1,Rice-1,Rice-1_Curry Powder,Ketchup,Wasabi',
    result: 'Raid,Flying,2/Humungo,Water,2/Encounter,Fire,1',
  },
  {
    // 16
    recipe:
      'Prosciutto-3,Prosciutto-3,Prosciutto-3,Prosciutto-3,Watercress-3_Pepper,Salt,Salt',
    result: 'Exp,Flying,1/Encounter,Psychic,1/Raid,Electric,1',
  },
  {
    // 17
    recipe:
      'Prosciutto-3,Prosciutto-3,Prosciutto-3,Prosciutto-3,Watercress-3,Watercress-3_Pepper,Salt,Salt',
    result: 'Exp,Flying,1/Encounter,Fighting,1/Raid,Normal,1',
  },
  {
    // 18
    recipe:
      'Hamburger-1,Prosciutto-3,Prosciutto-3,Prosciutto-3,Prosciutto-3_Ketchup',
    result: 'Encounter,Flying,1/Catch,Poison,1/Exp,Steel,1',
  },
  {
    // 19
    recipe:
      'Cheese-3,Chorizo-3,Chorizo-3,Chorizo-3,Chorizo-3,Tofu-3_Pepper,Whipped Cream',
    result: 'Humungo,Normal,2/Exp,Poison,1/Encounter,Dragon,1',
  },
  {
    // 20
    recipe: 'Rice-1,Rice-1,Rice-1,Rice-1,Rice-1,Rice-1_Pepper,Whipped Cream',
    result: 'Humungo,Normal,2/Raid,Fighting,2/Encounter,Flying,1',
  },
  {
    // 21
    recipe:
      'Green Bell Pepper-3,Green Bell Pepper-3,Green Bell Pepper-3,Green Bell Pepper-2_Ketchup',
    result: 'Item,Poison,1/Encounter,Normal,1/Catch,Flying,1',
  },
  {
    // 22
    recipe: 'Prosciutto-3,Prosciutto-2_Ketchup',
    result: 'Encounter,Flying,1/Catch,Normal,1/Raid,Poison,1',
  },
  {
    // 23
    recipe: 'Watercress-2_Ketchup',
    result: 'Teensy,Flying,1/Raid,Normal,1/Exp,Poison,1',
  },
  {
    // 24
    recipe: 'Noodles-0_Ketchup',
    result: 'Encounter,Flying,1/Raid,Normal,1/Exp,Poison,1',
  },
  {
    // 25
    recipe: 'Noodles-0_Ketchup,Mustard',
    result: 'Encounter,Flying,1/Raid,Ground,1/Exp,Poison,1',
  },
  {
    // 26
    recipe: 'Watercress-2_Ketchup',
    result: 'Teensy,Flying,1/Raid,Normal,1/Exp,Poison,1',
  },
  {
    // 27
    recipe:
      'Egg-3,Noodles-1,Noodles-1,Noodles-1,Noodles-1,Noodles-1_Wasabi,Wasabi,Yogurt,Yogurt',
    result: 'Raid,Ice,2/Humungo,Electric,1/Encounter,Rock,1',
  },
  {
    // 28
    recipe: 'Basil-4,Basil-4,Basil-1_Salt',
    result: 'Exp,Electric,1/Raid,Fire,1/Egg,,1',
  },
  {
    // 29
    recipe: 'Basil-4,Basil-4,Basil-1,Herbed Sausage-3_Salt',
    result: 'Exp,Psychic,1/Raid,Dark,1/Egg,,1',
  },
  {
    // 30
    recipe: 'Basil-4,Basil-4,Basil-1,Herbed Sausage-2_Salt',
    result: 'Exp,Psychic,1/Raid,Dark,1/Egg,,1',
  },
  {
    // 31
    recipe: 'Avocado-3,Basil-4,Basil-0,Prosciutto-3,Prosciutto-3_Mustard',
    result: 'Encounter,Flying,1/Catch,Fire,1/Raid,Dragon,1',
  },
  {
    // 32
    recipe: 'Apple-3,Basil-2,Cheese-2,Prosciutto-2,Watercress-2_Mustard',
    result: 'Exp,Flying,1/Raid,Ice,1/Item,Steel,1',
  },
  {
    // 33
    recipe: 'Red Onion-3,Red Onion-3,Red Onion-3,Red Onion-2_Butter',
    result: 'Egg,,1/Encounter,Normal,1/Catch,Bug,1',
  },
  {
    // 34
    recipe: 'Onion-3,Onion-3,Onion-3,Onion-3_Butter',
    result: 'Raid,Psychic,1/Encounter,Ghost,1/Catch,Bug,1',
  },
  {
    // 35
    recipe: 'Onion-3,Onion-3,Onion-3,Onion-3,Strawberry-3_Salt',
    result: 'Raid,Psychic,1/Encounter,Ghost,1/Catch,Fighting,1',
  },
  {
    // 36 - weird [1, 2, 3] typing
    recipe:
      'Hamburger-1,Hamburger-1,Hamburger-1,Hamburger-1,Hamburger-1,Red Bell Pepper-3_Peanut Butter,Peanut Butter',
    result: 'Encounter,Steel,1/Catch,Fire,1/Exp,Normal,1',
  },
  {
    // 37
    recipe:
      'Green Bell Pepper-3,Green Bell Pepper-3,Green Bell Pepper-3,Green Bell Pepper-3,Kiwi-3,Kiwi-3_Chili Sauce',
    result: 'Item,Poison,1/Encounter,Dragon,1/Catch,Fire,1',
  },
  {
    // 38
    recipe:
      'Hamburger-1,Hamburger-1,Hamburger-1,Hamburger-1,Hamburger-1,Red Bell Pepper-3_Butter,Peanut Butter,Peanut Butter',
    result: 'Encounter,Steel,1/Catch,Bug,1/Raid,Fire,1',
  },
  {
    // 39
    recipe: 'Hamburger-1,Red Bell Pepper-3_Peanut Butter,Peanut Butter',
    result: 'Egg,,1/Encounter,Fire,1/Raid,Normal,1',
  },
];

// multiplayer
// const TEST_SET_MULTIPLAYER = [
//   {
//     // 1
//     recipe:
//       'Chorizo-3,Chorizo-3,Chorizo-3,Chorizo-3,Rice-1,Rice-1,Rice-1_Bitter Herba Mystica,Horseradish,Horseradish,Mayonnaise,Mayonnaise,Saltchorizo x4, rice x2, tofu x1, mayonnaise x4, horseradish x2, salt, bitter herba',
//     result: 'Title,Normal,3/Exp,Normal,3/Encounter,Normal,3',
//   },
//   {
//     // 2
//     recipe:
//       'Ham-3,Ham-3,Ham-3,Ham-3,Herbed Sausage-1,Herbed Sausage-3,Herbed Sausage-3,Herbed Sausage-3,Noodles-1,Noodles-1_Whipped Cream,Whipped Cream,Whipped Cream,Whipped Cream,Whipped Cream,Whipped Cream,Whipped Cream,Whipped Cream',
//     result: 'Encounter,Ground,2/Egg,,2/Item,Fighting,1',
//   },
//   {
//     // 3
//     recipe:
//       'Noodles-1,Noodles-1,Noodles-1,Noodles-1,Noodles-1,Noodles-1,Noodles-1,Noodles-1,Noodles-1,Noodles-1,Noodles-1_Bitter Herba Mystica,Curry Powder,Curry Powder,Salt',
//     result: 'Title,Electric,3/Humungo,Electric,3/Encounter,Electric,3',
//   },
//   {
//     // 4
//     recipe:
//       'Noodles-1,Noodles-1,Potato Salad-1,Potato Salad-1,Tomato-3,Tomato-3,Tomato-3,Tomato-3_Salt,Spicy Herba Mystica',
//     result: 'Title,Fairy,3/Humungo,Fairy,3/Encounter,Psychic,2',
//   },
//   {
//     // 5
//     recipe:
//       'Noodles-1,Noodles-1,Noodles-1,Noodles-1,Noodles-1,Noodles-1,Noodles-1_Bitter Herba Mystica,Salt',
//     result: 'Title,Electric,3/Humungo,Electric,3/Exp,Poison,3',
//   },
//   {
//     // 6
//     recipe:
//       'Basil-1,Noodles-1,Noodles-1,Noodles-1,Noodles-1,Noodles-1,Noodles-1,Noodles-1,Yellow Bell Pepper-3_Salt,Sweet Herba Mystica',
//     result: 'Title,Electric,3/Humungo,Electric,3/Encounter,Electric,3',
//   },
//   {
//     // 7
//     recipe:
//       'Basil-1,Noodles-1,Noodles-1,Noodles-1,Noodles-1,Noodles-1,Noodles-1,Noodles-1,Noodles-1,Yellow Bell Pepper-3_Bitter Herba Mystica,Salt',
//     result: 'Title,Electric,3/Humungo,Electric,3/Encounter,Electric,3',
//   },
//   {
//     // 8
//     recipe:
//       'Noodles-1,Noodles-1,Noodles-1,Noodles-1,Noodles-1,Noodles-1,Noodles-1,Noodles-1_Bitter Herba Mystica,Salt',
//     result: 'Title,Electric,3/Humungo,Electric,3/Exp,Electric,3',
//   },
//   {
//     // 9
//     recipe:
//       'Banana-3,Banana-3,Banana-3,Cheese-3,Cheese-3,Cheese-3,Cheese-3,Chorizo-3,Chorizo-3,Chorizo-3,Chorizo-3,Chorizo-3,Rice-1,Rice-1,Rice-1,Rice-1,Rice-1,Rice-1_Mayonnaise,Mayonnaise,Mayonnaise,Whipped Cream,Whipped Cream',
//     result: 'Encounter,Normal,3/Exp,Normal,3/Item,Normal,3',
//   },
// ];

// singleplayer dual-typing
// const TEST_SET_SPLIT_TYPING = [
//   {
//     // 1
//     recipe:
//       'Prosciutto-3,Prosciutto-3,Prosciutto-3,Prosciutto-3,Watercress-3,Watercress-1_Pepper,Salt,Salt',
//     result: 'Exp,Flying,1/Encounter,Fighting,1/Raid,Flying,1',
//   },
//   {
//     // 2
//     recipe:
//       'Prosciutto-3,Prosciutto-3,Prosciutto-3,Prosciutto-3,Watercress-3,Watercress-2_Pepper,Salt,Salt',
//     result: 'Exp,Flying,1/Encounter,Fighting,1/Raid,Flying,1',
//   },
//   {
//     // 3
//     recipe:
//       'Hamburger-1,Hamburger-1,Hamburger-1,Hamburger-1,Hamburger-1_Butter',
//     result: 'Exp,Steel,1/Encounter,Ghost,1/Catch,Steel,1',
//   },
//   {
//     // 4
//     recipe:
//       'Hamburger-1,Hamburger-1,Hamburger-1,Hamburger-1,Hamburger-1,Hamburger-1_Butter',
//     result: 'Encounter,Steel,1/Exp,Steel,1/Catch,Ghost,1',
//   },
//   {
//     // 5
//     recipe:
//       'Tofu-3,Tofu-3,Tofu-3,Tofu-3,Watercress-3,Watercress-1_Pepper,Pepper,Salt,Salt',
//     result: 'Exp,Normal,1/Raid,Flying,1/Encounter,Normal,1',
//   },
//   {
//     // 6
//     recipe:
//       'Prosciutto-3,Prosciutto-3,Prosciutto-3,Prosciutto-3,Watercress-3_Salt',
//     result: 'Encounter,Flying,1/Catch,Fighting,1/Raid,Flying,1',
//   },
//   {
//     // 7
//     recipe:
//       'Prosciutto-3,Prosciutto-3,Prosciutto-3,Prosciutto-3,Watercress-1_Ketchup,Whipped Cream,Whipped Cream',
//     result: 'Egg,,1/Encounter,Ground,1/Catch,Flying,1',
//   },
//   {
//     // 8
//     recipe: 'Prosciutto-3,Prosciutto-3,Prosciutto-3,Prosciutto-3_Ketchup',
//     result: 'Encounter,Flying,1/Catch,Normal,1/Exp,Flying,1',
//   },
//   {
//     // 9
//     recipe:
//       'Apple-1,Prosciutto-3,Prosciutto-3,Prosciutto-3,Prosciutto-3_Ketchup',
//     result: 'Encounter,Flying,1/Catch,Ice,1/Exp,Flying,1',
//   },
//   {
//     // 10
//     recipe:
//       'Green Bell Pepper-3,Green Bell Pepper-3,Green Bell Pepper-3,Green Bell Pepper-3_Ketchup',
//     result: 'Item,Poison,1/Encounter,Normal,1/Catch,Poison,1',
//   },
//   {
//     // 11
//     recipe:
//       'Green Bell Pepper-3,Green Bell Pepper-3,Green Bell Pepper-3,Green Bell Pepper-3,Kiwi-3_Ketchup,Ketchup,Ketchup,Ketchup',
//     result: 'Teensy,Poison,1/Encounter,Dragon,1/Raid,Poison,1',
//   },
//   {
//     // 12
//     recipe:
//       'Cheese-2,Hamburger-1,Hamburger-1,Hamburger-1,Hamburger-1,Hamburger-1_Butter',
//     result: 'Exp,Steel,1/Encounter,Ghost,1/Catch,Steel,1',
//   },
//   {
//     // 13
//     recipe:
//       'Cheese-3,Hamburger-1,Hamburger-1,Hamburger-1,Hamburger-1,Hamburger-1_Butter',
//     result: 'Encounter,Steel,1/Catch,Ghost,1/Exp,Steel,1',
//   },
//   {
//     // 14
//     recipe: 'Ham-3,Ham-3,Ham-3,Ham-3_Mustard',
//     result: 'Encounter,Ground,1/Catch,Normal,1/Exp,Ground,1',
//   },
//   {
//     // 15
//     recipe:
//       'Tofu-3,Tofu-3,Tofu-3,Tofu-3,Watercress-3,Watercress-2_Pepper,Pepper,Salt,Salt',
//     result: 'Exp,Normal,1/Raid,Flying,1/Encounter,Normal,1',
//   },
//   {
//     // 16
//     recipe: 'Red Onion-3,Red Onion-3,Red Onion-3,Red Onion-3_Butter',
//     result: 'Egg,,1/Encounter,Normal,1/Catch,Ghost,1',
//   },
//   {
//     // 17
//     recipe:
//       'Hamburger-1,Hamburger-1,Hamburger-1,Hamburger-1,Hamburger-1,Red Bell Pepper-1_Peanut Butter,Peanut Butter',
//     result: 'Encounter,Steel,1/Catch,Normal,1/Raid,Steel,1',
//   },
//   {
//     // 18
//     recipe:
//       'Hamburger-1,Hamburger-1,Hamburger-1,Hamburger-1,Hamburger-1,Red Bell Pepper-2_Peanut Butter,Peanut Butter',
//     result: 'Encounter,Steel,1/Catch,Normal,1/Raid,Steel,1',
//   },
//   {
//     // 19
//     recipe:
//       'Hamburger-1,Hamburger-1,Hamburger-1,Hamburger-1,Hamburger-1,Watercress-1_Peanut Butter,Peanut Butter,Peanut Butter,Peanut Butter',
//     result: 'Encounter,Steel,1/Raid,Normal,1/Catch,Steel,1',
//   },
//   {
//     // 20
//     recipe:
//       'Hamburger-1,Hamburger-1,Hamburger-1,Hamburger-1,Hamburger-1,Watercress-2_Peanut Butter,Peanut Butter,Peanut Butter,Peanut Butter',
//     result: 'Encounter,Steel,1/Raid,Normal,1/Catch,Steel,1',
//   },
//   {
//     // 21
//     recipe:
//       'Hamburger-1,Hamburger-1,Hamburger-1,Hamburger-1,Hamburger-1,Watercress-3_Peanut Butter,Peanut Butter,Peanut Butter,Peanut Butter',
//     result: 'Encounter,Steel,1/Raid,Normal,1/Catch,Steel,1',
//   },
//   {
//     // 22
//     recipe:
//       'Hamburger-1,Hamburger-1,Hamburger-1,Hamburger-1,Hamburger-1,Hamburger-1_Peanut Butter,Peanut Butter,Peanut Butter,Peanut Butter',
//     result: 'Encounter,Steel,1/Catch,Steel,1/Raid,Normal,1',
//   },
//   {
//     // 23
//     recipe:
//       'Hamburger-1,Hamburger-1,Hamburger-1,Hamburger-1,Hamburger-1,Hamburger-1_Peanut Butter',
//     result: 'Encounter,Steel,1/Exp,Steel,1/Catch,Normal,1',
//   },
//   {
//     // 24
//     recipe:
//       'Hamburger-1,Hamburger-1,Hamburger-1,Hamburger-1,Hamburger-1,Hamburger-1_Mustard',
//     result: 'Encounter,Steel,1/Exp,Steel,1/Catch,Rock,1',
//   },
//   {
//     // 25
//     recipe:
//       'Apple-1,Hamburger-1,Hamburger-1,Hamburger-1,Hamburger-1,Hamburger-1_Peanut Butter,Peanut Butter,Peanut Butter,Peanut Butter',
//     result: 'Encounter,Steel,1/Raid,Flying,1/Catch,Steel,1',
//   },
// ];

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

    console.debug({ levelWeight, mpWeight });
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
    // const numFillings = sandwich!.fillings.length;

    expect(numHerba).toBe(0);
    // expect(numIngredients).toBeLessThanOrEqual(7);
  });

  it('Produces a sandwich with Lv 2 Catch Bug', () => {
    const sandwich = makeSandwichForPower({
      mealPower: 'Catch',
      type: 'Bug',
      level: 2,
    });

    // One viable recipe: 4x chorizo, 1x cherry tomato, 1x banana, 3x jam
    expect(sandwich).not.toBeNull();

    // const numFillings = sandwich!.fillings.length;

    // expect(numIngredients).toBeLessThanOrEqual(9);
  });

  it('Produces a sandwich with Lv 2 Egg', () => {
    const sandwich = makeSandwichForPower({
      mealPower: 'Egg',
      type: 'Bug',
      level: 2,
    });

    // 4x Chorizo, 1x Banana, 1x (Banana OR potato salad OR fried fillet), 2x Whippped Cream
    expect(sandwich).not.toBeNull();

    // const numFillings = sandwich!.fillings.length;

    // expect(numIngredients).toBeLessThanOrEqual(8);
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
    // Need to check if wasabi works and if so, our algorithm needs to change
    // Otherwise adding potato salad and sub horseradish for wasabi definitely should work
    expect(sandwich).not.toBeNull();
    // point of screwup: adding third horseradish or PB

    const numFillings = sandwich!.fillings.length;

    console.debug(
      `${sandwich!.fillings
        .map((f) => f.name)
        .join(', ')}, ${sandwich!.condiments.map((c) => c.name).join(', ')}`,
    );
    expect(numFillings).toBeLessThanOrEqual(5);
  });

  // it('Produces a sandwich with Lv 2 mp t', () => {
  //   const sandwich = makeSandwichForPower({
  //     mealPower: 'Catch',
  //     type: 'Bug',
  //     level: 2,
  //   });

  //   //
  //   expect(sandwich).not.toBeNull();

  //   const numIngredients =
  //     sandwich!.condiments.length + sandwich!.fillings.length;

  //   console.debug(
  //     `${sandwich!.fillings
  //       .map((f) => f.name)
  //       .join(', ')}, ${sandwich!.condiments.map((c) => c.name).join(', ')}`,
  //   );
  //   expect(numIngredients).toBeLessThanOrEqual(7);
  // });
});
