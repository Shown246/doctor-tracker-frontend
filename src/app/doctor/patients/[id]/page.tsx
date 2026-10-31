import { Suspense } from 'react';
import { notFound } from 'next/navigation';
import { PatientDetailView } from '@/components/clinical';
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
      <PatientDetailView id={id} />
    </Suspense>
  );
}
