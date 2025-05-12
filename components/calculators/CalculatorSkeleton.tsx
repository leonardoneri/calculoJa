export default function CalculatorSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="h-8 bg-gray-200 rounded w-1/3 mb-6"></div>

      <div className="space-y-4 mb-6">
        <div className="h-10 bg-gray-200 rounded"></div>
        <div className="h-10 bg-gray-200 rounded"></div>
        <div className="h-10 bg-gray-200 rounded"></div>
      </div>

      <div className="h-12 bg-gray-200 rounded w-1/4 mb-6"></div>

      <div className="h-32 bg-gray-200 rounded"></div>
    </div>
  )
}
