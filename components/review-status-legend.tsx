import { ReviewStatusBadge } from "@/components/review-status-badge";
import { REVIEW_STATUS_DESCRIPTION, REVIEW_STATUS_ORDER } from "@/lib/content/review-status";
import { cn } from "@/lib/utils";

/**
 * Explains the review-status badges shown on the control cards below it.
 *
 * The badge label already carries the state, so the legend exists to spell out
 * what each state means for a reader rather than to disambiguate colour alone.
 */
export function ReviewStatusLegend({ className }: { className?: string }) {
  return (
    <section
      aria-labelledby="review-status-legend"
      className={cn("rounded-2xl border border-border bg-muted/20 p-5", className)}
    >
      <h3 id="review-status-legend" className="text-sm font-semibold">
        Review status
      </h3>
      <dl className="mt-3 grid gap-3 sm:grid-cols-3">
        {REVIEW_STATUS_ORDER.map((status) => (
          <div key={status} className="space-y-1.5">
            <dt>
              <ReviewStatusBadge status={status} />
            </dt>
            <dd className="text-sm leading-6 text-muted-foreground">
              {REVIEW_STATUS_DESCRIPTION[status]}
            </dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
