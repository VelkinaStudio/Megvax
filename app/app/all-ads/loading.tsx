import { PageHeaderSkeleton, TableSkeleton } from '@/components/ui/Skeleton';

export default function AllAdsLoading() {
  return (
    <div className="space-y-6">
      <PageHeaderSkeleton />
      <TableSkeleton rows={10} />
    </div>
  );
}
