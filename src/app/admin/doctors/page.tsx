import { Suspense } from 'react';
import { DoctorsPage } from '@/components/management';
import { Loading } from '@/components/shared';
export default function Page() {
  return (
    <Suspense fallback={<Loading />}>
      <DoctorsPage />
    </Suspense>
  );
}
