import { Star } from "lucide-react";

export function Stars({ value }: { value: number | null }) {
  const rounded = value == null ? 0 : Math.round(value);
  return (
    <span
      className="inline-flex items-center gap-0.5"
      aria-label={value == null ? "No rating yet" : `${value.toFixed(1)} out of 5`}
    >
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          aria-hidden
          className={star <= rounded ? "size-4 fill-accent text-accent" : "size-4 text-line"}
          strokeWidth={1.75}
        />
      ))}
    </span>
  );
}
