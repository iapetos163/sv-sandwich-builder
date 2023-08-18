declare module 'simple-simplex' {
  export type Constraint<Objective extends Record<string, number>> = {
    namedVector: Partial<Objective>;
    constraint: '<=' | '>=' | '=';
    constant: number;
  };

  export default class SimpleSimplex<Objective extends Record<string, number>> {
    constructor(config: {
      objective: Objective;
      constraints: Constraint<Objective>[];
      optimizationType: 'min' | 'max';
    });

    public solve(options: { methodName: 'simplex' | unknown }): {
      solution: Objective;
      details: {
        isOptimal: boolean;
        allTableaus: unknown;
      };
    };
  }
}
