import { Suspense } from 'react';
import { NewPatient } from '@/components/management';
import { Loading } from '@/components/shared';
export default function Page() {
  return (
    <Suspense fallback={<Loading />}>
      <NewPatient />
    </Suspense>
  );
}
