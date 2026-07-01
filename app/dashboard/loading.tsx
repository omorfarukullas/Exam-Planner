export default function DashboardLoading() {
  return (
    <div className="space-y-8">
      {/* Header Skeleton */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="h-9 w-64 bg-gray-200 rounded-lg animate-pulse mb-2" />
          <div className="h-5 w-40 bg-gray-100 rounded animate-pulse" />
        </div>
        <div className="h-12 w-36 bg-gray-200 rounded-2xl animate-pulse" />
      </div>

      {/* Stats Skeleton */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="border border-gray-100 bg-gray-50 rounded-2xl p-4 animate-pulse">
            <div className="h-8 w-8 bg-gray-200 rounded-lg mb-2" />
            <div className="h-8 w-16 bg-gray-200 rounded mb-1" />
            <div className="h-4 w-24 bg-gray-200 rounded" />
          </div>
        ))}
      </div>

      {/* Cards Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3].map(i => (
          <div key={i} className="h-[280px] bg-white rounded-3xl border border-gray-100 p-5 animate-pulse">
            <div className="flex justify-between mb-4">
              <div className="h-6 w-24 bg-gray-200 rounded-lg" />
              <div className="h-6 w-20 bg-gray-200 rounded-full" />
            </div>
            <div className="h-6 w-48 bg-gray-200 rounded mb-4" />
            <div className="space-y-3 mb-6">
              <div className="h-4 w-32 bg-gray-100 rounded" />
              <div className="h-4 w-28 bg-gray-100 rounded" />
            </div>
            <div className="mt-auto">
              <div className="flex justify-between mb-2">
                <div className="h-3 w-12 bg-gray-100 rounded" />
                <div className="h-3 w-8 bg-gray-100 rounded" />
              </div>
              <div className="h-1.5 w-full bg-gray-100 rounded-full" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
