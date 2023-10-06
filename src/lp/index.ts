import type { GLPK as GLPKInstance, LP } from 'glpk.js';
import GLPK from 'glpk.js';

// @ts-expect-error
const _glpk: Promise<GLPKInstance> = GLPK();

export type Objective = {
  direction: 'min' | 'max';
  coefficients: Record<string, number>;
};

export type Bounds =
  | { upperBound: number; lowerBound?: never; equals?: never }
  | { upperBound?: never; lowerBound: number; equals?: never }
  | { upperBound: number; lowerBound: number; equals?: never }
  | { upperBound?: never; lowerBound?: never; equals: number };

export type Constraint = Bounds & {
  name?: string;
  coefficients: Record<string, number>;
};

export interface Model {
  objective: Objective;
  constraints: Constraint[];
}

export const transformModel = (glpk: GLPKInstance, model: Model): LP => {
  const variableNames = new Set<string>();

  const objective = {
    direction:
      model.objective.direction === 'min' ? glpk.GLP_MIN : glpk.GLP_MAX,
    name: 'obj',
    vars: Object.entries(model.objective.coefficients).map(([name, coef]) => {
      variableNames.add(name);
      return { name, coef };
    }),
  };

  const subjectTo = model.constraints.map(
    ({ coefficients, upperBound, lowerBound, equals, name }, i) => {
      let bnds = { type: -1, ub: 0, lb: 0 };
      if (typeof equals === 'number') {
        bnds = { type: glpk.GLP_FX, ub: equals, lb: equals };
      } else if (
        typeof upperBound === 'number' &&
        typeof lowerBound === 'number'
      ) {
        bnds = { type: glpk.GLP_DB, ub: upperBound, lb: lowerBound };
      } else if (typeof upperBound === 'number') {
        bnds = { type: glpk.GLP_UP, ub: upperBound, lb: 0 };
      } else if (typeof lowerBound === 'number') {
        bnds = { type: glpk.GLP_LO, ub: 0, lb: lowerBound };
      }

      const vars = Object.entries(coefficients).map(([name, coef]) => {
        variableNames.add(name);
        return { name, coef };
      });

      return { name: name || `cons${i}`, vars, bnds };
    },
  );

  return {
    name: 'LP',
    objective,
    subjectTo,
    generals: Array.from(variableNames),
  };
};

export const solve = async (model: Model) => {
  const glpk = await _glpk;
  const transformedModel = transformModel(glpk, model);

  const {
    result: { vars, z, status },
  } = await glpk.solve(transformedModel, { tmlim: 3 });

  return {
    status:
      status !== glpk.GLP_NOFEAS
        ? ('optimal' as const)
        : ('infeasible' as const),
    variables: vars,
    objectiveValue: z,
  };
};
