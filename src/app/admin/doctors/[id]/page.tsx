import { Suspense } from 'react';
import { notFound } from 'next/navigation';
import { DoctorDetailView } from '@/components/management';
import { Loading } from '@/components/shared';
export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  if (!/^[a-f0-9]{24}$/i.test(id)) notFound();
  return (
    <Suspense fallback={<Loading />}>
      <DoctorDetailView id={id} />
    </Suspense>
  );
}
