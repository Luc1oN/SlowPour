import React from 'react'

export function Skeleton({ className = '' }) {
  return <div className={`skeleton rounded-lg ${className}`} aria-hidden="true" />
}

export function WhiskeyCardSkeleton() {
  return (
    <div className="flex items-center gap-4 p-4 rounded-xl border border-border/40 bg-card/60">
      <Skeleton className="w-12 h-16 flex-shrink-0" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-4 w-2/3" />
        <Skeleton className="h-3 w-1/2" />
        <Skeleton className="h-3 w-1/3" />
      </div>
    </div>
  )
}

export function LeaderboardSkeleton() {
  return (
    <div className="rounded-xl p-4 border border-border/40 bg-card/60 flex items-center gap-4">
      <Skeleton className="w-9 h-9 rounded-full flex-shrink-0" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-4 w-1/2" />
        <Skeleton className="h-2 w-full" />
      </div>
      <Skeleton className="w-12 h-14 flex-shrink-0" />
    </div>
  )
}
