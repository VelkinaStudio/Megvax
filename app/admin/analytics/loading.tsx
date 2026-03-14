import { PageHeaderSkeleton, StatCardSkeleton, ChartSkeleton } from '@/components/ui/Skeleton';

export default function AdminAnalyticsLoading() {
  return (
    <div className="space-y-6">
      <PageHeaderSkeleton />
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCardSkeleton />
        <StatCardSkeleton />
        <StatCardSkeleton />
      </div>

      <ChartSkeleton />
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartSkeleton />
        <ChartSkeleton />
      </div>
    </div>
  );
}
