import { Suspense, lazy } from 'react';
import InitResult from './InitResult';
import type { ResultSetProps } from './ResultSet';

export type { ResultSetProps };
export * from './types';

//@ts-ignore
const ResultSetFull = lazy(() => import('./ResultSet.js'));

const ResultSet = (props: ResultSetProps) => (
  <Suspense fallback={<InitResult />}>
    <ResultSetFull {...props} />
  </Suspense>
);

export default ResultSet;
