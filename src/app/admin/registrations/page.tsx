import { Suspense } from 'react';
import { RegistrationsPage } from '@/components/registrations';
import { Loading } from '@/components/shared';
export default function Page() {
  return (
    <Suspense fallback={<Loading />}>
      <RegistrationsPage />
    </Suspense>
  );
}
