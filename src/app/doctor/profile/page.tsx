import { Suspense } from 'react';
import { ProfileView } from '@/components/profile';
import { Loading } from '@/components/shared';
export default function Page() {
  return (
    <Suspense fallback={<Loading />}>
      <ProfileView />
    </Suspense>
  );
}
