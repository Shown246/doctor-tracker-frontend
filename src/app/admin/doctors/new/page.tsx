import { Suspense } from 'react';
import { NewDoctor } from '@/components/management';
import { Loading } from '@/components/shared';
export default function Page() {
  return (
    <Suspense fallback={<Loading />}>
      <NewDoctor />
    </Suspense>
  );
}
