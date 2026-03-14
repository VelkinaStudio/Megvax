import { PageHeaderSkeleton, CardSkeleton } from '@/components/ui/Skeleton';

export default function AdminMessagesLoading() {
  return (
    <div className="space-y-6">
      <PageHeaderSkeleton />
      
      <div className="space-y-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <CardSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}
