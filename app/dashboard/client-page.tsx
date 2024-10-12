'use client';

import { useSearchParams } from 'next/navigation';

const ClientPage = () => {
  const searchParams = useSearchParams();
  const param1 = searchParams?.get('param1'); // DEMO USAGE

  return <div>Param1: {param1 || 'unset'}</div>;
};

export default ClientPage;
