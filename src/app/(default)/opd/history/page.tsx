import ClientPage from './ClientPage';
import { Suspense } from 'react';

export default function OPDHistoryPage() {
  return (
    <Suspense>
      <ClientPage />
    </Suspense>
  );
}
