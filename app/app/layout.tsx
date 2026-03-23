import { Suspense } from 'react';
import DashboardShell from './DashboardShell';
import { AuthGuard } from '@/lib/auth-guard';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthGuard>
      <Suspense fallback={<div className="min-h-screen bg-gray-50" />}>
        <DashboardShell>{children}</DashboardShell>
      </Suspense>
    </AuthGuard>
  );
}
