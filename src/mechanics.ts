import CONDIMENTS from './data/condiments.json';
import FILLINGS from './data/fillings.json';
import SANDWICHES from './data/sandwiches.json';
import { mealPowers as POWERS, allTypes as TYPES, MealPower } from './powers';

export interface Filling {
  name: string;
  pieces: number;
  powers: Power[];
  tastes: Taste[];
  types: PkType[];
}
export interface Condiment {
  name: string;
  powers: Power[];
  tastes: Taste[];
  types: PkType[];
}
export type Ingredient = Filling | Condiment;
export interface Ingredients {
  fillings: Filling[];
  condiments: Condiment[];
}
export interface PkType {
  type: string;
  amount: number;
}
export interface Power {
  type: MealPower;
  amount: number;
  modded?: boolean;
  boosted?: boolean;
}

type Flavor = 'Sweet' | 'Sour' | 'Salty' | 'Bitter' | 'Hot';

export interface Taste {
  flavor: Flavor;
  amount: number;
}

export interface Effect {
  name: string;
  fullPower: string;
  type: string;
  fullType: PkType;
  level: number;
}

export interface Sandwich {
  number: string;
  name: string;
  description: string;
  fillings: Filling[];
  condiments: Condiment[];
  effects: Effect[];
  totalPieces?: number;
  stars?: number;
  pass?: boolean;
}

const FLAVORS: Flavor[] = ['Sweet', 'Salty', 'Sour', 'Bitter', 'Hot'];

export const oneTwoFirst = [
  '31',
  '35',
  '51',
  '55',
  '59',
  '63',
  '67',
  '71',
  '75',
  '79',
  '103',
  '111',
  '119',
  '123',
  '131',
  '139',
  '143',
  '147',
  '151',
];

export const FLAVOR_TABLE = {
  Sweet: {
    Salty: 'Egg',
    Sour: 'Catch',
    Bitter: 'Egg',
    Hot: 'Raid',
  } as Record<Flavor, MealPower>,
  Salty: {
    Sweet: 'Encounter',
    Sour: 'Encounter',
    Bitter: 'Exp',
    Hot: 'Encounter',
  } as Record<Flavor, MealPower>,
  Sour: {
    Sweet: 'Catch',
    Salty: 'Teensy',
    Bitter: 'Teensy',
    Hot: 'Teensy',
  } as Record<Flavor, MealPower>,
  Bitter: {
    Sweet: 'Item',
    Salty: 'Exp',
    Sour: 'Item',
    Hot: 'Item',
  } as Record<Flavor, MealPower>,
  Hot: {
    Sweet: 'Raid',
    Salty: 'Humungo',
    Sour: 'Humungo',
    Bitter: 'Humungo',
  } as Record<Flavor, MealPower>,
};

export const FLAVOR_TABLE_EZ = {
  Egg: 'sweet-salty/bitter',
  Catch: 'sweet/sour',
  Raid: 'sweet/hot',
  Encounter: 'salty-sweet/sour/hot',
  Exp: 'salty/bitter',
  Teensy: 'sour-salty/bitter/hot',
  Item: 'bitter-sweet/sour/hot',
  Humungo: 'hot-salty/sour/bitter',
};

export const FLAVOR_PRIORITY_TABLE = {
  Sweet: {
    Salty: 'Sweet',
    Sour: 'Sweet',
    Bitter: 'Sweet',
    Hot: 'Sweet',
  },
  Salty: {
    Sweet: 'Sweet',
    Sour: 'Salty',
    Bitter: 'Salty',
    Hot: 'Salty',
  },
  Sour: {
    Sweet: 'Sweet',
    Salty: 'Salty',
    Bitter: 'Sour',
    Hot: 'Sour',
  },
  Bitter: {
    Sweet: 'Sweet',
    Salty: 'Salty',
    Sour: 'Sour',
    Hot: 'Bitter',
  },
  Hot: {
    Sweet: 'Sweet',
    Salty: 'Salty',
    Sour: 'Sour',
    Bitter: 'Bitter',
  },
};

export const ALIAS_TO_FULL = {
  // power alias
  Egg: 'Egg Power',
  Catch: 'Catching Power',
  Item: 'Item Drop Power',
  Humungo: 'Humungo Power',
  Teensy: 'Teensy Power',
  Raid: 'Raid Power',
  Encounter: 'Encounter Power',
  Exp: 'Exp. Point Power',
  Title: 'Title Power',
  Sparkling: 'Sparkling Power',
};

export const FULL_TO_ALIAS = {
  // power alias
  'Egg Power': 'Egg',
  'Catching Power': 'Catch',
  'Item Drop Power': 'Item',
  'Humungo Power': 'Humungo',
  'Teensy Power': 'Teensy',
  'Raid Power': 'Raid',
  'Encounter Power': 'Encounter',
  'Exp. Point Power': 'Exp',
  'Title Power': 'Title',
  'Sparkling Power': 'Sparkling',
};

export const TYPE_EXCEPTIONS = {
  '39': ['Flying', 'Poison', 'Fighting'], // I'm convinced this is a game bug and it's only counting the flavors on apple once
};

export const getFillings = (strArr: string[]): Filling[] => {
  const ret: Filling[] = [];
  for (const str of strArr) {
    const filling = FILLINGS.filter((x) => x.name === str)[0] as Filling;
    if (filling) {
      ret.push({ ...filling });
    }
  }

  return ret;
};

export const getCondiments = (strArr: string[]) => {
  const ret = [];
  for (const str of strArr) {
    const condiment = CONDIMENTS.filter((x) => x.name === str)[0] as Condiment;
    if (condiment) {
      ret.push({ ...condiment });
    }
  }

  return ret;
};

export const getIngredientsFromRecipe = (
  recipe: string,
): Ingredients | undefined => {
  if (recipe && recipe.length > 0) {
    const fillings = [];
    let condiments = [];
    const spl = recipe.split('_');
    if (spl.length !== 2) {
      return;
    } // should probably regex check string but whatever
    const fillingStr = spl[0];
    const condimentStr = spl[1];

    const fNames = fillingStr.split(',');
    const cNames = condimentStr.split(',');

    for (const str of fNames) {
      const name = str.split('-')[0];
      const piecesStr = str.split('-')[1];
      const pieces = parseInt(piecesStr);
      const filling = FILLINGS.filter((x) => x.name === name)[0] as Filling;
      if (filling) {
        fillings.push({ ...filling, pieces });
      }
    }

    condiments = getCondiments(cNames);

    return { fillings, condiments };
  }

  return undefined;
};

export const getRecipeFromIngredients = (ingredients: Ingredients) => {
  const condiments = ingredients.condiments;
  const fillings = ingredients.fillings;
  if (condiments.length === 0) {
    return undefined;
  }

  const fArr = [];
  for (const f of fillings) {
    fArr.push(`${f.name}-${f.pieces}`);
  }

  return `${fArr.join(',')}_${condiments.map((x) => x.name).join(',')}`;
};

type Sums = {
  tastes: Taste[];
  powers: Power[];
  types: PkType[];
  overflowed: boolean;
};

export const getIngredientsSums = (
  fillings: Filling[],
  condiments: Condiment[],
) => {
  const ingredients: Ingredient[] = [
    ...fillings.sort((a, b) => a.name.localeCompare(b.name)),
    ...condiments.sort((a, b) => a.name.localeCompare(b.name)),
  ];

  const sums: Sums = {
    tastes: [],
    powers: [],
    types: [],
    overflowed: false, // how many pieces on sandwich past the single ingredient limit
  };

  const tempFillingPieces: Record<string, number> = {};

  for (const food of ingredients) {
    if ('pieces' in food && food.pieces) {
      const existingPieces = tempFillingPieces[food.name] || 0;
      tempFillingPieces[food.name] = existingPieces + food.pieces;
    }

    for (const taste of food.tastes) {
      const hasEntry = sums.tastes.filter((x) => x.flavor === taste.flavor)[0];
      let amount = 0; // existing amount
      if (hasEntry) {
        amount = hasEntry.amount;
        sums.tastes = sums.tastes.filter((x) => x.flavor !== taste.flavor);
      }

      sums.tastes.push({
        flavor: taste.flavor,
        amount: amount + calculatePowerAmount(taste.amount, food, taste),
      });
    }

    for (const power of food.powers) {
      const hasEntry = sums.powers.filter((x) => x.type === power.type)[0];
      let amount = 0; // existing amount
      if (hasEntry) {
        amount = hasEntry.amount;
        sums.powers = sums.powers.filter((x) => x.type !== power.type);
      }

      sums.powers.push({
        type: power.type,
        amount: amount + calculatePowerAmount(power.amount, food),
      });
    }

    for (const type of food.types) {
      const hasEntry = sums.types.filter((x) => x.type === type.type)[0];
      let amount = 0; // existing amount
      if (hasEntry) {
        amount = hasEntry.amount;
        sums.types = sums.types.filter((x) => x.type !== type.type);
      }

      sums.types.push({
        type: type.type,
        amount: amount + calculatePowerAmount(type.amount, food, type),
      });
    }
  }

  // remove zero types
  sums.types = sums.types.filter((t) => t.amount > 0);

  const multiplayer = fillings.length > 6 || condiments.length > 4;
  for (const pieces of Object.values(tempFillingPieces)) {
    const singleIngredientLimit = multiplayer ? 15 : 12; // todo: make a constants file with all this stuff
    if (pieces > singleIngredientLimit) {
      sums.overflowed = true;
    }
  }

  sums.tastes.sort((a, b) => {
    return (
      b.amount - a.amount ||
      FLAVORS.indexOf(a.flavor) - FLAVORS.indexOf(b.flavor)
    );
  });
  sums.powers.sort((a, b) => {
    const aType = ALIAS_TO_FULL[a.type];
    const bType = ALIAS_TO_FULL[b.type];
    return b.amount - a.amount || POWERS.indexOf(aType) - POWERS.indexOf(bType);
  });
  sums.types.sort((a, b) => {
    return b.amount - a.amount || TYPES.indexOf(a.type) - TYPES.indexOf(b.type);
  });

  if (sums.tastes.length === 1) {
    sums.tastes.push({
      flavor: (FLAVORS as Flavor[]).filter(
        (x) => x !== sums.tastes[0].flavor,
      )[0],
      amount: 0,
    });
  }
  if (sums.tastes.length > 1) {
    // at least 2 flavors exist, so check table..
    const flavor1 = sums.tastes[0].flavor;
    const flavor2 = sums.tastes[1].flavor;
    const statBoost = FLAVOR_TABLE[flavor1][flavor2];
    const existingStat = sums.powers.filter((x) => x.type === statBoost)[0];
    if (!existingStat) {
      sums.powers.push({
        type: statBoost,
        amount: 100,
        modded: true,
        boosted: true, // boosted 'from zero' stats don't count in determining level
      });
    } else {
      existingStat.amount += 100;
      existingStat.modded = true;
    }
    sums.powers.sort((a, b) => {
      const aType = ALIAS_TO_FULL[a.type];
      const bType = ALIAS_TO_FULL[b.type];
      return (
        b.amount - a.amount || POWERS.indexOf(aType) - POWERS.indexOf(bType)
      );
    });
  }

  return sums;
};

// returns array of levels
const calculateLevels = (types: PkType[]): [number, number, number] => {
  const [
    { amount: firstTypeAmount } = { amount: 0 },
    { amount: secondTypeAmount } = { amount: 0 },
    { amount: thirdTypeAmount } = { amount: 0 },
  ] = types;

  if (firstTypeAmount >= 460) {
    return [3, 3, 3];
  }

  if (firstTypeAmount >= 380) {
    if (secondTypeAmount >= 380 && thirdTypeAmount >= 380) {
      return [3, 3, 3];
    }
    return [3, 3, 2];
  }

  if (firstTypeAmount > 280) {
    if (thirdTypeAmount >= 180) {
      return [2, 2, 2];
    }
    return [2, 2, 1];
  }

  if (firstTypeAmount >= 180) {
    if (secondTypeAmount >= 180 && thirdTypeAmount >= 180) {
      return [2, 2, 1];
    }
    return [2, 1, 1];
  }

  return [1, 1, 1];
};

export const craftSandwich = (
  fillings: Filling[],
  condiments: Condiment[],
  sums: Sums,
) => {
  if (
    sums.tastes.length === 0 ||
    sums.powers.length === 0 ||
    sums.types.length === 0 ||
    fillings.length === 0 ||
    condiments.length === 0
  ) {
    return;
  }

  // get sandwich star level

  const formattedTypes = sums.types.slice(0);
  while (formattedTypes.length < 3) {
    formattedTypes.push({
      type: TYPES.filter(
        (x) => formattedTypes.map((y) => y.type).indexOf(x) === -1,
      )[0],
      amount: 0,
    });
  }
  const formattedPowers = sums.powers
    .slice(0)
    .filter((x) => x.type !== 'Sparkling' || x.amount >= 2000);
  const myTypes: string[] = [];

  // default sandwich genset with accurate effects and type[1, 3, 2] as base
  const generatedSandwich: Sandwich = {
    number: '???',
    name: 'Custom Sandwich',
    description: 'A Tasty Coolio Original',
    fillings,
    condiments,
    effects: formattedPowers
      .map((x, i) => {
        const safeIndex = Math.min(i, formattedTypes.length - 1);
        let fullType = formattedTypes[safeIndex];
        let type = fullType.type;
        if (i === 1) {
          fullType = formattedTypes[2];
          type =
            fullType?.type || TYPES.filter((x) => myTypes.indexOf(x) === -1)[0];
        }
        if (i === 2) {
          fullType = formattedTypes[1];
          type =
            fullType?.type || TYPES.filter((x) => myTypes.indexOf(x) === -1)[0];
        }

        if (!fullType) {
          fullType = {
            type,
            amount: 0,
          };
        }

        const name = ALIAS_TO_FULL[x.type];
        myTypes.push(type);

        return {
          name,
          fullType,
          fullPower: x,
          type,
          level: 1,
        };
      })
      .filter((x, i) => i < 3),
    imageUrl: SANDWICHES[0].imageUrl,
    piecesOverflowed: sums.overflowed,
  };

  // types and levels handling
  const newTypes = calculateTypes(formattedTypes, generatedSandwich);

  // can only have an effect if we have a type
  // so remove effect lines without a type
  const revisedEffects = [];
  for (let i = 0; i < generatedSandwich.effects.length; i++) {
    const newType = newTypes[i];
    if (!newType) {
      continue;
    }
    generatedSandwich.effects[i].type = newType.type;
    generatedSandwich.effects[i].fullType = newType;
    revisedEffects.push(generatedSandwich.effects[i]);
  }
  generatedSandwich.effects = revisedEffects;

  // handle levels
  // levels continue to remain not 100% consistent
  // so trial-and-error is still going on here
  const levels = calculateLevels(formattedTypes);
  for (let i = 0; i < generatedSandwich.effects.length; i++) {
    const effect = generatedSandwich.effects[i];
    effect.level = levels[i];
  }

  // remove types from egg powers
  for (const effect of generatedSandwich.effects) {
    if (effect.name === 'Egg Power') {
      effect.type = '';
    }
  }

  return generatedSandwich;
};

export const isFilling = (obj: Ingredient | undefined): obj is Filling => {
  if (!obj) {
    return false;
  }
  return FILLINGS.filter((x) => x.name === obj.name)[0] !== undefined;
};

// check if two arrays contain the same elements
export const areEqual = <T>(array1: T[], array2: T[]) => {
  if (array1.length === array2.length) {
    const diff = array1.filter(
      (x) =>
        !array2.includes(x) ||
        array2.filter((y) => y === x).length !==
          array1.filter((y) => y === x).length,
    );
    return diff.length === 0;
  }

  return false;
};

export const calculatePowerAmount = (base: number, ingredient: Ingredient) => {
  let newAmount = base;
  const isCondiment = !isFilling(ingredient);

  if (!isCondiment /* && !isType(power)*/) {
    newAmount *= ingredient.pieces;
  }

  return newAmount;
};

const sums = getIngredientsSums(activeFillings, activeCondiments);

const foundSandwich = checkPresetSandwich(
  sums,
  activeFillings,
  activeCondiments,
);
const generatedSandwich = craftSandwich(
  activeFillings,
  activeCondiments,
  sums,
  foundSandwich,
);
