import { PageHeaderSkeleton, TableSkeleton } from '@/components/ui/Skeleton';

export default function AdminAuditLoading() {
  return (
    <div className="space-y-6">
      <PageHeaderSkeleton />
      <TableSkeleton rows={12} />
    </div>
  );
}
