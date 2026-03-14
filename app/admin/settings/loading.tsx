import { PageHeaderSkeleton, CardSkeleton } from '@/components/ui/Skeleton';

export default function AdminSettingsLoading() {
  return (
    <div className="space-y-6">
      <PageHeaderSkeleton />
      
      <div className="space-y-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <CardSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}
