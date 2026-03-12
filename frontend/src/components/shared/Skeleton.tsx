import clsx from 'clsx'

export function Skeleton({ className }: { className?: string }) {
  return (
    <div
      className={clsx(
        'animate-pulse bg-gradient-to-r from-[#1e1e2e] via-[#2a2a3e] to-[#1e1e2e] bg-[length:200%_100%] rounded-lg',
        className
      )}
    />
  )
}

export function ResultsSkeleton() {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <Skeleton className="h-36" />
        <Skeleton className="h-36" />
      </div>
      <Skeleton className="h-48" />
      <Skeleton className="h-40" />
    </div>
  )
}
