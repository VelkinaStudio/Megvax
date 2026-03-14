import { PageHeaderSkeleton, TableSkeleton } from '@/components/ui/Skeleton';

export default function AdminUsersLoading() {
  return (
    <div className="space-y-6">
      <PageHeaderSkeleton />
      <TableSkeleton rows={10} />
    </div>
  );
}
