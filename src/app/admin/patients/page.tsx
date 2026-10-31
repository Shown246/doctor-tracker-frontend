import { Suspense } from 'react';
import { PatientsPage } from '@/components/management';
import { Loading } from '@/components/shared';
export default function Page() {
  return (
    <Suspense fallback={<Loading />}>
      <PatientsPage />
    </Suspense>
  );
}
