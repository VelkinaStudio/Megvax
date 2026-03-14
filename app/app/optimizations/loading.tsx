import { PageHeaderSkeleton, CardSkeleton } from '@/components/ui/Skeleton';

export default function OptimizationsLoading() {
  return (
    <div className="space-y-6">
      <PageHeaderSkeleton />
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <CardSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}
