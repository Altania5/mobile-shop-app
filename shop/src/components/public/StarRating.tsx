import { Star } from "lucide-react";

// Pure display component (safe in server components).
export function StarRating({ rating, className = "" }: { rating: number; className?: string }) {
  return (
    <div className={`flex items-center gap-0.5 ${className}`} aria-label={`${rating} out of 5 stars`}>
      {[1, 2, 3, 4, 5].map((n) => (
        <Star
          key={n}
          className="h-4 w-4"
          fill={n <= rating ? "#d4af37" : "none"}
          stroke={n <= rating ? "#d4af37" : "#cbd5e1"}
        />
      ))}
    </div>
  );
}
