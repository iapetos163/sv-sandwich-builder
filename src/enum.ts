export enum Flavor {
  SWEET,
  SALTY,
  SOUR,
  BITTER,
  SPICY,
}

export enum MealPower {
  EGG,
  CATCH,
  EXP,
  ITEM,
  RAID,
  SPARKLING,
  TITLE,
  HUMUNGO,
  TEENSY,
  ENCOUNTER,
}

export enum TypeIndex {
  NORMAL,
  FIGHTING,
  FLYING,
  POISON,
  GROUND,
  ROCK,
  BUG,
  GHOST,
  STEEL,
  FIRE,
  WATER,
  GRASS,
  ELECTRIC,
  PSYCHIC,
  ICE,
  DRAGON,
  DARK,
  FAIRY,
}

export const rangeFlavors = [...Array(5).keys()];
export const rangeTypes = [...Array(18).keys()];
export const rangeMealPowers = [...Array(10).keys()];
