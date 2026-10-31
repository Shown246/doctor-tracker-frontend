import type { Metadata } from 'next';
import { Providers } from '@/components/providers';
import './portal.css';
export const metadata: Metadata = {
  title: { default: 'Doctor Tracker', template: '%s · Doctor Tracker' },
  description:
    'A connected workspace for administrators, doctors and patients.',
};
export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
