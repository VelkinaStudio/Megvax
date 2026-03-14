import { PageHeaderSkeleton, TableSkeleton, StatCardSkeleton } from '@/components/ui/Skeleton';

export default function CampaignsLoading() {
  return (
    <div className="space-y-6">
      <PageHeaderSkeleton />
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCardSkeleton />
        <StatCardSkeleton />
        <StatCardSkeleton />
      </div>

      <TableSkeleton rows={8} />
    </div>
  );
}
