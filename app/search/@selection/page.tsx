import { SelectionView } from './selection-view';
import { Suspense } from 'react';
import { redirect } from 'next/navigation';
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

async function Component() {
  const supabase = createServerComponentClient({ cookies });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return redirect('/login');
  }

  return <SelectionView />;
}

export default async function Page() {
  return (
    <Suspense>
      <Component />
    </Suspense>
  );
}