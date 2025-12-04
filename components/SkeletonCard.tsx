export default function SkeletonCard() {
  return (
    <div className="
      rounded-3xl p-6
      bg-white/[0.02] dark:bg-white/[0.02]
      border border-white/[0.05]
      backdrop-blur-2xl
      animate-pulse
    ">
      {/* Icon skeleton */}
      <div className="w-12 h-12 bg-white/10 rounded-2xl mb-4" />

      {/* Value skeleton */}
      <div className="h-10 w-20 bg-white/10 rounded-xl mb-2" />

      {/* Label skeleton */}
      <div className="h-4 w-32 bg-white/10 rounded-lg mb-3" />

      {/* Sparkline skeleton */}
      <div className="flex items-end gap-1 h-8">
        {[...Array(8)].map((_, i) => (
          <div
            key={i}
            className="flex-1 bg-white/10 rounded-sm"
            style={{ height: `${Math.random() * 100}%` }}
          />
        ))}
      </div>
    </div>
  );
}
