import GLPK, { GLPK as GLPKInstance, LP } from 'glpk.js';

const glpk: GLPKInstance = (GLPK as any)();

export type Objective = {
  direction: 'min' | 'max';
  coefficients: Record<string, number>;
};

export type Constraint = {
  name?: string;
  coefficients: Record<string, number>;
  upperBound?: number;
  lowerBound?: number;
};

export interface Model {
  objective: Objective;
  constraints: Constraint[];
}

export const transformModel = (model: Model): LP => {
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
    ({ coefficients, upperBound, lowerBound, name }, i) => {
      let bnds = { type: -1, ub: 0, lb: 0 };
      if (typeof upperBound === 'number' && typeof lowerBound === 'number') {
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

export const solve = (model: Model) => {
  const transformedModel = transformModel(model);

  const {
    result: { vars, z, status },
  } = glpk.solve(transformedModel);

  return {
    variables: vars,
    objectiveValue: z,
  };
};
