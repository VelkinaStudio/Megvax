import { PageHeaderSkeleton, TableSkeleton } from '@/components/ui/Skeleton';

export default function AdminInvoicesLoading() {
  return (
    <div className="space-y-6">
      <PageHeaderSkeleton />
      <TableSkeleton rows={8} />
    </div>
  );
}
