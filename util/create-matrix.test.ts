import { innerProduct } from '../src/vector-math';
import { createMatrix } from './create-matrix';

const ingredients = [
  {
    flavorVector: [12, 9, 0, 3, 0],
    baseMealPowerVector: [12, -3, 0, 21, 0, 0, 0, -15, 0, 0],
    typeVector: [0, 0, 21, 0, 0, 0, 0, 0, 21, 0, 0, 0, 0, 0, 21, 0, 0, 0],
    metaVector: [
      12, -3, 0, 21, 0, 0, 0, -15, 0, 0, 0, 0, 21, 0, 0, 0, 0, 0, 21, 0, 0, 0,
      0, 0, 21, 0, 0, 0, 12, 9, 0, 3, 0,
    ],
  },
  {
    flavorVector: [9, 3, 0, 0, 0],
    baseMealPowerVector: [0, 12, 0, 0, -3, 0, 0, 0, 0, 21],
    typeVector: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 18, 0, 0],
    metaVector: [
      0, 12, 0, 0, -3, 0, 0, 0, 0, 21, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
      0, 18, 0, 0, 9, 3, 0, 0, 0,
    ],
  },
  {
    flavorVector: [3, 3, 15, 12, 0],
    baseMealPowerVector: [0, 12, 0, 0, -3, 0, 0, 0, 0, 21],
    typeVector: [0, 0, 0, 0, 0, 18, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    metaVector: [
      0, 12, 0, 0, -3, 0, 0, 0, 0, 21, 0, 0, 0, 0, 0, 18, 0, 0, 0, 0, 0, 0, 0,
      0, 0, 0, 0, 0, 3, 3, 15, 12, 0,
    ],
  },
  {
    flavorVector: [12, 3, 0, 0, 0],
    baseMealPowerVector: [12, -3, 0, 21, 0, 0, 0, -15, 0, 0],
    typeVector: [21, 0, 0, 0, 0, 0, 21, 0, 0, 0, 0, 0, 21, 0, 0, 0, 0, 0],
    metaVector: [
      12, -3, 0, 21, 0, 0, 0, -15, 0, 0, 21, 0, 0, 0, 0, 0, 21, 0, 0, 0, 0, 0,
      21, 0, 0, 0, 0, 0, 12, 3, 0, 0, 0,
    ],
  },
  {
    flavorVector: [0, 4, 4, 16, 0],
    baseMealPowerVector: [8, 0, 0, 0, 8, 0, 0, 0, 0, -8],
    typeVector: [0, 0, 0, 0, 0, 0, 0, 0, 0, 4, 4, 4, 4, 4, 4, 4, 4, 4],
    metaVector: [
      8, 0, 0, 0, 8, 0, 0, 0, 0, -8, 0, 0, 0, 0, 0, 0, 0, 0, 0, 4, 4, 4, 4, 4,
      4, 4, 4, 4, 0, 4, 4, 16, 0,
    ],
  },
  {
    flavorVector: [3, 0, 9, 0, 0],
    baseMealPowerVector: [0, 6, 6, 6, 0, 0, 0, 0, 0, -6],
    typeVector: [
      15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15,
    ],
    metaVector: [
      0, 6, 6, 6, 0, 0, 0, 0, 0, -6, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15,
      15, 15, 15, 15, 15, 15, 15, 3, 0, 9, 0, 0,
    ],
  },
  {
    flavorVector: [9, 15, 0, 3, 0],
    baseMealPowerVector: [0, 12, 0, 0, -3, 0, 0, 0, 0, 21],
    typeVector: [0, 0, 0, 0, 0, 0, 18, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    metaVector: [
      0, 12, 0, 0, -3, 0, 0, 0, 0, 21, 0, 0, 0, 0, 0, 0, 18, 0, 0, 0, 0, 0, 0,
      0, 0, 0, 0, 0, 9, 15, 0, 3, 0,
    ],
  },
  {
    flavorVector: [0, 0, 12, 6, 12],
    baseMealPowerVector: [0, 0, 21, -3, 0, 0, 0, 0, 0, 12],
    typeVector: [36, 0, 0, 36, 0, 0, 36, 0, 0, 36, 0, 0, 36, 0, 0, 36, 0, 0],
    metaVector: [
      0, 0, 21, -3, 0, 0, 0, 0, 0, 12, 36, 0, 0, 36, 0, 0, 36, 0, 0, 36, 0, 0,
      36, 0, 0, 36, 0, 0, 0, 0, 12, 6, 12,
    ],
  },
  {
    flavorVector: [0, 3, 0, 3, 0],
    baseMealPowerVector: [0, 12, 0, 0, -3, 0, 0, 0, 0, 21],
    typeVector: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 18, 0, 0, 0, 0, 0, 0, 0],
    metaVector: [
      0, 12, 0, 0, -3, 0, 0, 0, 0, 21, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 18, 0, 0,
      0, 0, 0, 0, 0, 0, 3, 0, 3, 0,
    ],
  },
  {
    flavorVector: [3, 0, 6, 3, 0],
    baseMealPowerVector: [0, 0, 21, -3, 0, 0, 0, 0, 0, 12],
    typeVector: [0, 0, 36, 0, 0, 36, 0, 0, 36, 0, 0, 36, 0, 0, 36, 0, 0, 36],
    metaVector: [
      0, 0, 21, -3, 0, 0, 0, 0, 0, 12, 0, 0, 36, 0, 0, 36, 0, 0, 36, 0, 0, 36,
      0, 0, 36, 0, 0, 36, 3, 0, 6, 3, 0,
    ],
  },
  {
    flavorVector: [2, 0, 3, 3, 0],
    baseMealPowerVector: [0, 21, 0, 0, 12, 0, 0, 0, 0, -3],
    typeVector: [20, 0, 20, 0, 20, 0, 20, 0, 20, 0, 20, 0, 20, 0, 20, 0, 20, 0],
    metaVector: [
      0, 21, 0, 0, 12, 0, 0, 0, 0, -3, 20, 0, 20, 0, 20, 0, 20, 0, 20, 0, 20, 0,
      20, 0, 20, 0, 20, 0, 2, 0, 3, 3, 0,
    ],
  },
  {
    flavorVector: [3, 3, 0, 15, 0],
    baseMealPowerVector: [0, 12, 0, 0, -3, 0, 0, 0, 0, 21],
    typeVector: [0, 0, 0, 18, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    metaVector: [
      0, 12, 0, 0, -3, 0, 0, 0, 0, 21, 0, 0, 0, 18, 0, 0, 0, 0, 0, 0, 0, 0, 0,
      0, 0, 0, 0, 0, 3, 3, 0, 15, 0,
    ],
  },
  {
    flavorVector: [3, 0, 15, 0, 0],
    baseMealPowerVector: [0, 12, 0, 0, -3, 0, 0, 0, 0, 21],
    typeVector: [0, 0, 0, 0, 18, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    metaVector: [
      0, 12, 0, 0, -3, 0, 0, 0, 0, 21, 0, 0, 0, 0, 18, 0, 0, 0, 0, 0, 0, 0, 0,
      0, 0, 0, 0, 0, 3, 0, 15, 0, 0,
    ],
  },
  {
    flavorVector: [6, 0, 12, 9, 0],
    baseMealPowerVector: [0, 12, 0, 0, -3, 0, 0, 0, 0, 21],
    typeVector: [0, 0, 0, 0, 0, 0, 0, 0, 18, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    metaVector: [
      0, 12, 0, 0, -3, 0, 0, 0, 0, 21, 0, 0, 0, 0, 0, 0, 0, 0, 18, 0, 0, 0, 0,
      0, 0, 0, 0, 0, 6, 0, 12, 9, 0,
    ],
  },
  {
    flavorVector: [3, 0, 12, 12, 0],
    baseMealPowerVector: [0, 0, 21, -3, 0, 0, 0, 0, 0, 12],
    typeVector: [0, 36, 0, 0, 36, 0, 0, 36, 0, 0, 36, 0, 0, 36, 0, 0, 36, 0],
    metaVector: [
      0, 0, 21, -3, 0, 0, 0, 0, 0, 12, 0, 36, 0, 0, 36, 0, 0, 36, 0, 0, 36, 0,
      0, 36, 0, 0, 36, 0, 3, 0, 12, 12, 0,
    ],
  },
  {
    flavorVector: [0, 6, 0, 0, 15],
    baseMealPowerVector: [12, -3, 0, 21, 0, 0, 0, -15, 0, 0],
    typeVector: [0, 0, 0, 0, 0, 21, 0, 0, 0, 0, 0, 21, 0, 0, 0, 0, 0, 21],
    metaVector: [
      12, -3, 0, 21, 0, 0, 0, -15, 0, 0, 0, 0, 0, 0, 0, 21, 0, 0, 0, 0, 0, 21,
      0, 0, 0, 0, 0, 21, 0, 6, 0, 0, 15,
    ],
  },
  {
    flavorVector: [6, 15, 0, 3, 0],
    baseMealPowerVector: [12, -3, 0, 21, 0, 0, 0, -15, 0, 0],
    typeVector: [0, 0, 0, 21, 0, 0, 0, 0, 0, 21, 0, 0, 0, 0, 0, 21, 0, 0],
    metaVector: [
      12, -3, 0, 21, 0, 0, 0, -15, 0, 0, 0, 0, 0, 21, 0, 0, 0, 0, 0, 21, 0, 0,
      0, 0, 0, 21, 0, 0, 6, 15, 0, 3, 0,
    ],
  },
  {
    flavorVector: [12, 0, 12, 0, 0],
    baseMealPowerVector: [0, 12, 0, 0, -3, 0, 0, 0, 0, 21],
    typeVector: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 18, 0, 0, 0],
    metaVector: [
      0, 12, 0, 0, -3, 0, 0, 0, 0, 21, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
      18, 0, 0, 0, 12, 0, 12, 0, 0,
    ],
  },
  {
    flavorVector: [3, 0, 0, 6, 0],
    baseMealPowerVector: [0, 12, 0, 0, -3, 0, 0, 0, 0, 21],
    typeVector: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 18, 0, 0, 0, 0, 0, 0],
    metaVector: [
      0, 12, 0, 0, -3, 0, 0, 0, 0, 21, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 18, 0,
      0, 0, 0, 0, 0, 3, 0, 0, 6, 0,
    ],
  },
  {
    flavorVector: [0, 0, 4, 0, 0],
    baseMealPowerVector: [0, 0, 0, 0, 0, 0, 0, 21, -3, 12],
    typeVector: [0, 0, 0, 30, 30, 30, 0, 0, 0, 0, 0, 0, 30, 30, 30, 0, 0, 0],
    metaVector: [
      0, 0, 0, 0, 0, 0, 0, 21, -3, 12, 0, 0, 0, 30, 30, 30, 0, 0, 0, 0, 0, 0,
      30, 30, 30, 0, 0, 0, 0, 0, 4, 0, 0,
    ],
  },
  {
    flavorVector: [6, 0, 0, 3, 9],
    baseMealPowerVector: [0, 12, 0, 0, -3, 0, 0, 0, 0, 21],
    typeVector: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 18, 0, 0, 0, 0],
    metaVector: [
      0, 12, 0, 0, -3, 0, 0, 0, 0, 21, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
      18, 0, 0, 0, 0, 6, 0, 0, 3, 9,
    ],
  },
  {
    flavorVector: [3, 12, 0, 6, 0],
    baseMealPowerVector: [0, 12, 0, 0, -3, 0, 0, 0, 0, 21],
    typeVector: [0, 18, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    metaVector: [
      0, 12, 0, 0, -3, 0, 0, 0, 0, 21, 0, 18, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
      0, 0, 0, 0, 0, 3, 12, 0, 6, 0,
    ],
  },
  {
    flavorVector: [9, 15, 0, 3, 0],
    baseMealPowerVector: [12, -3, 0, 21, 0, 0, 0, -15, 0, 0],
    typeVector: [0, 0, 0, 0, 21, 0, 0, 0, 0, 0, 21, 0, 0, 0, 0, 0, 21, 0],
    metaVector: [
      12, -3, 0, 21, 0, 0, 0, -15, 0, 0, 0, 0, 0, 0, 21, 0, 0, 0, 0, 0, 21, 0,
      0, 0, 0, 0, 21, 0, 9, 15, 0, 3, 0,
    ],
  },
  {
    flavorVector: [2, 4, 3, 1, 0],
    baseMealPowerVector: [0, 0, 0, 0, 0, 0, 0, 21, -3, 12],
    typeVector: [0, 0, 0, 0, 0, 0, 30, 30, 30, 0, 0, 0, 0, 0, 0, 30, 30, 30],
    metaVector: [
      0, 0, 0, 0, 0, 0, 0, 21, -3, 12, 0, 0, 0, 0, 0, 0, 30, 30, 30, 0, 0, 0, 0,
      0, 0, 30, 30, 30, 2, 4, 3, 1, 0,
    ],
  },
  {
    flavorVector: [3, 1, 4, 3, 1],
    baseMealPowerVector: [0, 21, 0, 0, 12, 0, 0, 0, 0, -3],
    typeVector: [0, 20, 0, 20, 0, 20, 0, 20, 0, 20, 0, 20, 0, 20, 0, 20, 0, 20],
    metaVector: [
      0, 21, 0, 0, 12, 0, 0, 0, 0, -3, 0, 20, 0, 20, 0, 20, 0, 20, 0, 20, 0, 20,
      0, 20, 0, 20, 0, 20, 3, 1, 4, 3, 1,
    ],
  },
  {
    flavorVector: [6, 3, 12, 0, 0],
    baseMealPowerVector: [0, 12, 0, 0, -3, 0, 0, 0, 0, 21],
    typeVector: [0, 0, 18, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    metaVector: [
      0, 12, 0, 0, -3, 0, 0, 0, 0, 21, 0, 0, 18, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
      0, 0, 0, 0, 0, 6, 3, 12, 0, 0,
    ],
  },
  {
    flavorVector: [3, 3, 0, 9, 0],
    baseMealPowerVector: [0, 12, 0, 0, -3, 0, 0, 0, 0, 21],
    typeVector: [0, 0, 0, 0, 0, 0, 0, 0, 0, 18, 0, 0, 0, 0, 0, 0, 0, 0],
    metaVector: [
      0, 12, 0, 0, -3, 0, 0, 0, 0, 21, 0, 0, 0, 0, 0, 0, 0, 0, 0, 18, 0, 0, 0,
      0, 0, 0, 0, 0, 3, 3, 0, 9, 0,
    ],
  },
  {
    flavorVector: [9, 0, 0, 3, 0],
    baseMealPowerVector: [0, 12, 0, 0, -3, 0, 0, 0, 0, 21],
    typeVector: [0, 0, 0, 0, 0, 0, 0, 18, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    metaVector: [
      0, 12, 0, 0, -3, 0, 0, 0, 0, 21, 0, 0, 0, 0, 0, 0, 0, 18, 0, 0, 0, 0, 0,
      0, 0, 0, 0, 0, 9, 0, 0, 3, 0,
    ],
  },
  {
    flavorVector: [3, 1, 0, 0, 0],
    baseMealPowerVector: [0, 0, 0, 0, 0, 0, 0, 21, -3, 12],
    typeVector: [30, 30, 30, 0, 0, 0, 0, 0, 0, 30, 30, 30, 0, 0, 0, 0, 0, 0],
    metaVector: [
      0, 0, 0, 0, 0, 0, 0, 21, -3, 12, 30, 30, 30, 0, 0, 0, 0, 0, 0, 30, 30, 30,
      0, 0, 0, 0, 0, 0, 3, 1, 0, 0, 0,
    ],
  },
  {
    flavorVector: [3, 6, 9, 9, 0],
    baseMealPowerVector: [0, 12, 0, 0, -3, 0, 0, 0, 0, 21],
    typeVector: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 18, 0],
    metaVector: [
      0, 12, 0, 0, -3, 0, 0, 0, 0, 21, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
      0, 0, 18, 0, 3, 6, 9, 9, 0,
    ],
  },
  {
    flavorVector: [12, 12, 0, 0, 0],
    baseMealPowerVector: [12, -3, 0, 21, 0, 0, 0, -15, 0, 0],
    typeVector: [0, 21, 0, 0, 0, 0, 0, 21, 0, 0, 0, 0, 0, 21, 0, 0, 0, 0],
    metaVector: [
      12, -3, 0, 21, 0, 0, 0, -15, 0, 0, 0, 21, 0, 0, 0, 0, 0, 21, 0, 0, 0, 0,
      0, 21, 0, 0, 0, 0, 12, 12, 0, 0, 0,
    ],
  },
  {
    flavorVector: [9, 0, 0, 0, 0],
    baseMealPowerVector: [0, 12, 0, 0, -3, 0, 0, 0, 0, 21],
    typeVector: [18, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    metaVector: [
      0, 12, 0, 0, -3, 0, 0, 0, 0, 21, 18, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
      0, 0, 0, 0, 0, 9, 0, 0, 0, 0,
    ],
  },
  {
    flavorVector: [6, 12, 0, 3, 0],
    baseMealPowerVector: [0, 12, 0, 0, -3, 0, 0, 0, 0, 21],
    typeVector: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 18],
    metaVector: [
      0, 12, 0, 0, -3, 0, 0, 0, 0, 21, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
      0, 0, 0, 18, 6, 12, 0, 3, 0,
    ],
  },
  {
    flavorVector: [0, 6, 3, 15, 3],
    baseMealPowerVector: [6, 0, 0, 0, 6, 0, 0, 0, 0, -6],
    typeVector: [3, 3, 3, 3, 3, 3, 3, 3, 3, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    metaVector: [
      6, 0, 0, 0, 6, 0, 0, 0, 0, -6, 3, 3, 3, 3, 3, 3, 3, 3, 3, 0, 0, 0, 0, 0,
      0, 0, 0, 0, 0, 6, 3, 15, 3,
    ],
  },
  {
    flavorVector: [3, 3, 0, 9, 0],
    baseMealPowerVector: [0, 12, 0, 0, -3, 0, 0, 0, 0, 21],
    typeVector: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 18, 0, 0, 0, 0, 0],
    metaVector: [
      0, 12, 0, 0, -3, 0, 0, 0, 0, 21, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 18,
      0, 0, 0, 0, 0, 3, 3, 0, 9, 0,
    ],
  },
  {
    flavorVector: [12, 0, 12, 0, 0],
    baseMealPowerVector: [-3, 0, 12, 0, 21, 0, 0, 0, 0, 0],
    typeVector: [0, 0, 0, 0, 0, 0, 2, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    metaVector: [
      -3, 0, 12, 0, 21, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 2, 0, 0, 0, 0, 0, 0,
      0, 0, 0, 0, 12, 0, 12, 0, 0,
    ],
  },
  {
    flavorVector: [8, 8, 12, 0, 20],
    baseMealPowerVector: [-3, 0, 12, 0, 21, 0, 0, 0, 0, 0],
    typeVector: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 2, 0, 0, 0, 0, 0, 0],
    metaVector: [
      -3, 0, 12, 0, 21, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 2, 0, 0,
      0, 0, 0, 0, 8, 8, 12, 0, 20,
    ],
  },
  {
    flavorVector: [12, 12, 12, 0, 0],
    baseMealPowerVector: [5, 0, -3, 12, 0, 0, 0, 0, -15, 0],
    typeVector: [0, 0, 0, 0, 0, 0, 4, 0, 4, 0, 4, 0, 0, 0, 0, 0, 0, 0],
    metaVector: [
      5, 0, -3, 12, 0, 0, 0, 0, -15, 0, 0, 0, 0, 0, 0, 0, 4, 0, 4, 0, 4, 0, 0,
      0, 0, 0, 0, 0, 12, 12, 12, 0, 0,
    ],
  },
  {
    flavorVector: [4, 4, 4, 12, 30],
    baseMealPowerVector: [0, 0, 0, 0, 0, 0, 0, -3, 21, 12],
    typeVector: [0, 0, 0, 0, 0, 0, 2, 2, 2, 2, 2, 2, 0, 0, 0, 0, 0, 0],
    metaVector: [
      0, 0, 0, 0, 0, 0, 0, -3, 21, 12, 0, 0, 0, 0, 0, 0, 2, 2, 2, 2, 2, 2, 0, 0,
      0, 0, 0, 0, 4, 4, 4, 12, 30,
    ],
  },
  {
    flavorVector: [4, 0, 0, 0, 16],
    baseMealPowerVector: [0, 0, 0, 0, 0, 0, 0, -3, 21, 12],
    typeVector: [2, 2, 2, 2, 2, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    metaVector: [
      0, 0, 0, 0, 0, 0, 0, -3, 21, 12, 2, 2, 2, 2, 2, 2, 0, 0, 0, 0, 0, 0, 0, 0,
      0, 0, 0, 0, 4, 0, 0, 0, 16,
    ],
  },
  {
    flavorVector: [16, 16, 4, 0, 0],
    baseMealPowerVector: [5, 0, -3, 12, 0, 0, 0, 0, -15, 0],
    typeVector: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 4, 0, 4, 0, 4, 0],
    metaVector: [
      5, 0, -3, 12, 0, 0, 0, 0, -15, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 4,
      0, 4, 0, 4, 0, 16, 16, 4, 0, 0,
    ],
  },
  {
    flavorVector: [8, 16, 16, 0, 0],
    baseMealPowerVector: [-3, 0, 12, 0, 21, 0, 0, 0, 0, 0],
    typeVector: [0, 0, 2, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    metaVector: [
      -3, 0, 12, 0, 21, 0, 0, 0, 0, 0, 0, 0, 2, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
      0, 0, 0, 0, 8, 16, 16, 0, 0,
    ],
  },
  {
    flavorVector: [12, 16, 4, 20, 0],
    baseMealPowerVector: [5, 0, -3, 12, 0, 0, 0, 0, -15, 0],
    typeVector: [0, 4, 0, 4, 0, 4, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    metaVector: [
      5, 0, -3, 12, 0, 0, 0, 0, -15, 0, 0, 4, 0, 4, 0, 4, 0, 0, 0, 0, 0, 0, 0,
      0, 0, 0, 0, 0, 12, 16, 4, 20, 0,
    ],
  },
  {
    flavorVector: [0, 20, 8, 0, 0],
    baseMealPowerVector: [-3, 0, 12, 0, 21, 0, 0, 0, 0, 0],
    typeVector: [2, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    metaVector: [
      -3, 0, 12, 0, 21, 0, 0, 0, 0, 0, 2, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
      0, 0, 0, 0, 0, 20, 8, 0, 0,
    ],
  },
  {
    flavorVector: [4, 8, 8, 8, 16],
    baseMealPowerVector: [-3, 0, 12, 0, 21, 0, 0, 0, 0, 0],
    typeVector: [0, 0, 0, 0, 2, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    metaVector: [
      -3, 0, 12, 0, 21, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 2, 0, 0, 0, 0, 0, 0, 0, 0,
      0, 0, 0, 0, 4, 8, 8, 8, 16,
    ],
  },
  {
    flavorVector: [0, 4, 0, 4, 0],
    baseMealPowerVector: [5, 0, -3, 12, 0, 0, 0, 0, -15, 0],
    typeVector: [0, 0, 0, 0, 0, 0, 0, 4, 0, 4, 0, 4, 0, 0, 0, 0, 0, 0],
    metaVector: [
      5, 0, -3, 12, 0, 0, 0, 0, -15, 0, 0, 0, 0, 0, 0, 0, 0, 4, 0, 4, 0, 4, 0,
      0, 0, 0, 0, 0, 0, 4, 0, 4, 0,
    ],
  },
  {
    flavorVector: [16, 0, 12, 0, 0],
    baseMealPowerVector: [-3, 0, 12, 0, 21, 0, 0, 0, 0, 0],
    typeVector: [0, 0, 0, 0, 0, 0, 0, 0, 2, 2, 0, 0, 0, 0, 0, 0, 0, 0],
    metaVector: [
      -3, 0, 12, 0, 21, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 2, 0, 0, 0, 0,
      0, 0, 0, 0, 16, 0, 12, 0, 0,
    ],
  },
  {
    flavorVector: [0, 0, 4, 8, 16],
    baseMealPowerVector: [-3, 0, 12, 0, 21, 0, 0, 0, 0, 0],
    typeVector: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 2, 0, 0],
    metaVector: [
      -3, 0, 12, 0, 21, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
      2, 2, 0, 0, 0, 0, 4, 8, 16,
    ],
  },
  {
    flavorVector: [0, 0, 20, 4, 0],
    baseMealPowerVector: [-3, 0, 12, 0, 21, 0, 0, 0, 0, 0],
    typeVector: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 2, 0, 0, 0, 0],
    metaVector: [
      -3, 0, 12, 0, 21, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 2,
      0, 0, 0, 0, 0, 0, 20, 4, 0,
    ],
  },
  {
    flavorVector: [4, 20, 0, 4, 0],
    baseMealPowerVector: [5, 0, -3, 12, 0, 0, 0, 0, -15, 0],
    typeVector: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 4, 0, 4, 0, 4],
    metaVector: [
      5, 0, -3, 12, 0, 0, 0, 0, -15, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
      4, 0, 4, 0, 4, 4, 20, 0, 4, 0,
    ],
  },
  {
    flavorVector: [4, 0, 4, 0, 20],
    baseMealPowerVector: [0, 0, 0, 0, 0, 0, 0, -3, 21, 12],
    typeVector: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 2, 2, 2, 2, 2],
    metaVector: [
      0, 0, 0, 0, 0, 0, 0, -3, 21, 12, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 2,
      2, 2, 2, 2, 4, 0, 4, 0, 20,
    ],
  },
  {
    flavorVector: [20, 0, 0, 0, 0],
    baseMealPowerVector: [5, 0, -3, 12, 0, 0, 0, 0, -15, 0],
    typeVector: [4, 0, 4, 0, 4, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    metaVector: [
      5, 0, -3, 12, 0, 0, 0, 0, -15, 0, 4, 0, 4, 0, 4, 0, 0, 0, 0, 0, 0, 0, 0,
      0, 0, 0, 0, 0, 20, 0, 0, 0, 0,
    ],
  },
  {
    flavorVector: [16, 16, 0, 0, 0],
    baseMealPowerVector: [-3, 0, 12, 0, 21, 0, 0, 0, 0, 0],
    typeVector: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 2],
    metaVector: [
      -3, 0, 12, 0, 21, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
      0, 0, 2, 2, 16, 16, 0, 0, 0,
    ],
  },
  {
    flavorVector: [0, 0, 0, 500, 0],
    baseMealPowerVector: [0, 0, 0, 0, 0, 1000, 1000, 0, 0, 0],
    typeVector: [
      250, 250, 250, 250, 250, 250, 250, 250, 250, 250, 250, 250, 250, 250, 250,
      250, 250, 250,
    ],
    metaVector: [
      0, 0, 0, 0, 0, 1000, 1000, 0, 0, 0, 250, 250, 250, 250, 250, 250, 250,
      250, 250, 250, 250, 250, 250, 250, 250, 250, 250, 250, 0, 0, 0, 500, 0,
    ],
  },
  {
    flavorVector: [0, 0, 0, 0, 500],
    baseMealPowerVector: [0, 0, 0, 0, 0, 1000, 1000, 0, 0, 0],
    typeVector: [
      250, 250, 250, 250, 250, 250, 250, 250, 250, 250, 250, 250, 250, 250, 250,
      250, 250, 250,
    ],
    metaVector: [
      0, 0, 0, 0, 0, 1000, 1000, 0, 0, 0, 250, 250, 250, 250, 250, 250, 250,
      250, 250, 250, 250, 250, 250, 250, 250, 250, 250, 250, 0, 0, 0, 0, 500,
    ],
  },
  {
    flavorVector: [0, 0, 500, 0, 0],
    baseMealPowerVector: [0, 0, 0, 0, 0, 1000, 1000, 0, 0, 0],
    typeVector: [
      250, 250, 250, 250, 250, 250, 250, 250, 250, 250, 250, 250, 250, 250, 250,
      250, 250, 250,
    ],
    metaVector: [
      0, 0, 0, 0, 0, 1000, 1000, 0, 0, 0, 250, 250, 250, 250, 250, 250, 250,
      250, 250, 250, 250, 250, 250, 250, 250, 250, 250, 250, 0, 0, 500, 0, 0,
    ],
  },
  {
    flavorVector: [0, 500, 0, 0, 0],
    baseMealPowerVector: [0, 0, 0, 0, 0, 1000, 1000, 0, 0, 0],
    typeVector: [
      250, 250, 250, 250, 250, 250, 250, 250, 250, 250, 250, 250, 250, 250, 250,
      250, 250, 250,
    ],
    metaVector: [
      0, 0, 0, 0, 0, 1000, 1000, 0, 0, 0, 250, 250, 250, 250, 250, 250, 250,
      250, 250, 250, 250, 250, 250, 250, 250, 250, 250, 250, 0, 500, 0, 0, 0,
    ],
  },
  {
    flavorVector: [500, 0, 0, 0, 0],
    baseMealPowerVector: [0, 0, 0, 0, 0, 1000, 1000, 0, 0, 0],
    typeVector: [
      250, 250, 250, 250, 250, 250, 250, 250, 250, 250, 250, 250, 250, 250, 250,
      250, 250, 250,
    ],
    metaVector: [
      0, 0, 0, 0, 0, 1000, 1000, 0, 0, 0, 250, 250, 250, 250, 250, 250, 250,
      250, 250, 250, 250, 250, 250, 250, 250, 250, 250, 250, 500, 0, 0, 0, 0,
    ],
  },
];

describe('createMatrix', () => {
  it('Outputs rows that multiple with each ingredient to equal 1', () => {
    const matrix = createMatrix(ingredients);

    ingredients.forEach((ing, i) => {
      const product = innerProduct(ing.metaVector, matrix[i]);
      expect(product).toBeCloseTo(1);
    });
  });
});