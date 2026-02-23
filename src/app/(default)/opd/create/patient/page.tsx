export const metadata = {
  title: 'Create OPD — punleukrek pharmacy'
};

import { Suspense } from 'react';
import ClientPage from './ClientPage';

export default function Page() {
  return (
    <Suspense>
      <ClientPage />
    </Suspense>
  );
}
