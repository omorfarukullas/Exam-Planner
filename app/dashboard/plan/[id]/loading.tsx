export default function PlanLoading() {
  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-pulse">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="h-10 w-64 bg-gray-200 rounded-lg mb-2" />
          <div className="flex gap-4">
            <div className="h-5 w-32 bg-gray-100 rounded" />
            <div className="h-5 w-24 bg-gray-100 rounded" />
          </div>
        </div>
        <div className="flex gap-3">
          <div className="h-10 w-24 bg-gray-200 rounded-xl" />
          <div className="h-10 w-24 bg-gray-200 rounded-xl" />
        </div>
      </div>

      {/* Progress */}
      <div className="bg-white rounded-3xl border border-gray-100 p-6">
        <div className="flex justify-between mb-3">
          <div className="space-y-1">
            <div className="h-4 w-32 bg-gray-200 rounded" />
            <div className="h-3 w-40 bg-gray-100 rounded" />
          </div>
          <div className="h-8 w-16 bg-gray-200 rounded" />
        </div>
        <div className="h-3 w-full bg-gray-100 rounded-full" />
      </div>

      {/* Action Bar */}
      <div className="flex gap-2">
        <div className="h-10 w-40 bg-gray-200 rounded-2xl" />
        <div className="h-10 w-32 bg-gray-200 rounded-2xl" />
      </div>

      {/* Days */}
      <div className="space-y-6">
        {[1, 2, 3].map(i => (
          <div key={i} className="bg-white rounded-3xl border border-gray-100">
            <div className="px-5 py-4 border-b border-gray-50 flex justify-between">
              <div className="h-5 w-40 bg-gray-200 rounded" />
              <div className="h-4 w-12 bg-gray-100 rounded" />
            </div>
            <div className="p-4 space-y-2">
              {[1, 2].map(j => (
                <div key={j} className="flex items-start gap-3 p-3.5 border border-gray-100 rounded-2xl">
                  <div className="h-5 w-5 rounded-full bg-gray-200 shrink-0 mt-0.5" />
                  <div className="space-y-2 flex-1">
                    <div className="h-4 w-3/4 bg-gray-200 rounded" />
                    <div className="flex gap-2">
                      <div className="h-4 w-16 bg-gray-100 rounded" />
                      <div className="h-4 w-12 bg-gray-100 rounded" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
