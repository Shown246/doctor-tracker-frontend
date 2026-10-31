import { Suspense } from 'react';
import { MyDoctors } from '@/components/profile';
import { Loading } from '@/components/shared';
export default function Page() {
  return (
    <Suspense fallback={<Loading />}>
      <MyDoctors />
    </Suspense>
  );
}
