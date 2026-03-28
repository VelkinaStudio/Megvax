interface SkeletonProps {
  className?: string;
  style?: React.CSSProperties;
}

export function Skeleton({ className, style }: SkeletonProps) {
  return (
    <div 
      className={`animate-pulse bg-brand-black/10 rounded-[2px] ${className}`}
      style={style}
    />
  );
}

export function CardSkeleton() {
  return (
    <div className="bg-brand-white border-2 border-brand-black rounded-[2px] p-6 space-y-4">
      <div className="flex items-center justify-between">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-8 w-8 rounded-[2px]" />
      </div>
      <Skeleton className="h-8 w-1/2" />
      <div className="pt-4 border-t-2 border-brand-black">
        <Skeleton className="h-4 w-full" />
      </div>
    </div>
  );
}

export function TableRowSkeleton() {
  return (
    <div className="flex items-center gap-4 p-4 border-b-2 border-brand-black">
      <Skeleton className="h-4 w-1/3" />
      <Skeleton className="h-6 w-16 rounded-[2px]" />
      <div className="ml-auto flex gap-4">
         <Skeleton className="h-4 w-16" />
         <Skeleton className="h-4 w-12" />
      </div>
    </div>
  );
}

export function TableSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="border-2 border-brand-black rounded-[2px] overflow-hidden">
      <div className="bg-brand-black/5 p-4 border-b-2 border-brand-black">
        <div className="flex gap-4">
          <Skeleton className="h-4 w-1/4" />
          <Skeleton className="h-4 w-1/4" />
          <Skeleton className="h-4 w-1/4" />
          <Skeleton className="h-4 w-1/4" />
        </div>
      </div>
      {Array.from({ length: rows }).map((_, i) => (
        <TableRowSkeleton key={i} />
      ))}
    </div>
  );
}

export function ChartSkeleton() {
  return (
    <div className="bg-brand-white border-2 border-brand-black rounded-[2px] p-6">
      <div className="flex items-center justify-between mb-6">
        <Skeleton className="h-6 w-32" />
        <Skeleton className="h-8 w-24 rounded-[2px]" />
      </div>
      <div className="h-64 flex items-end gap-2">
        {[45, 72, 38, 88, 55, 29, 67, 81, 43, 60, 75, 34].map((h, i) => (
          <Skeleton
            key={i}
            className="flex-1"
            style={{ height: `${h}%` }}
          />
        ))}
      </div>
    </div>
  );
}

export function StatCardSkeleton() {
  return (
    <div className="bg-brand-white border-2 border-brand-black rounded-[2px] p-6">
      <Skeleton className="h-4 w-24 mb-3" />
      <Skeleton className="h-8 w-32 mb-2" />
      <Skeleton className="h-3 w-20" />
    </div>
  );
}

export function PageHeaderSkeleton() {
  return (
    <div className="mb-6">
      <Skeleton className="h-8 w-48 mb-2" />
      <Skeleton className="h-4 w-96" />
    </div>
  );
}
