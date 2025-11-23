import { Metadata } from 'next';
import AllHistoryClientPage from './ClientPage';

export const metadata: Metadata = {
  title: 'All History OPD — punleukrek pharmacy'
};

export default function AllHistoryPage() {
  return <AllHistoryClientPage />;
}
