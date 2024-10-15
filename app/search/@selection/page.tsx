import { SelectionView } from './selection-view';
import { Suspense } from 'react';

async function Component() {
  return <SelectionView />;
}

export default async function Page() {
  return (
    <Suspense>
      <Component />
    </Suspense>
  );
}
