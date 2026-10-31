import { Suspense } from 'react';
import { DashboardView } from '@/components/dashboard';
import { Loading } from '@/components/shared';
export default function Page() {
  return (
    <Suspense fallback={<Loading />}>
      <DashboardView />
    </Suspense>
  );
}
