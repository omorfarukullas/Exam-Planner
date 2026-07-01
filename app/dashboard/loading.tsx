export default function DashboardLoading() {
  return (
    <div className="space-y-8">
      {/* Header Skeleton */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="h-9 w-64 skeleton mb-2" />
          <div className="h-5 w-40 skeleton" />
        </div>
        <div className="h-12 w-36 skeleton !rounded-2xl" />
      </div>

      {/* Stats Skeleton */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="glass-card p-4">
            <div className="h-8 w-8 skeleton !rounded-lg mb-2" />
            <div className="h-8 w-16 skeleton mb-1" />
            <div className="h-4 w-24 skeleton" />
          </div>
        ))}
      </div>

      {/* Cards Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3].map(i => (
          <div key={i} className="h-[280px] glass-card p-5">
            <div className="h-1.5 w-full skeleton !rounded-full mb-4" />
            <div className="flex justify-between mb-4">
              <div className="h-6 w-24 skeleton !rounded-lg" />
              <div className="h-6 w-20 skeleton !rounded-full" />
            </div>
            <div className="h-6 w-48 skeleton mb-4" />
            <div className="space-y-3 mb-6">
              <div className="h-4 w-32 skeleton" />
              <div className="h-4 w-28 skeleton" />
            </div>
            <div className="mt-auto">
              <div className="flex justify-between mb-2">
                <div className="h-3 w-12 skeleton" />
                <div className="h-3 w-8 skeleton" />
              </div>
              <div className="h-1.5 w-full skeleton !rounded-full" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
