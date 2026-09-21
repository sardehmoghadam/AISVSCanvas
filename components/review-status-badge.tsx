import { Badge } from "@/components/ui/badge";
import {
  reviewStatusBadgeVariant,
  reviewStatusDescription,
  reviewStatusLabel,
} from "@/lib/content/review-status";

/**
 * Renders a control's `reviewStatus` as a labelled, colour-coded badge.
 *
 * The label differs for every status, so the state is readable without colour
 * perception; `title` carries the same explanation the legend spells out.
 */
export function ReviewStatusBadge({ status, className }: { status: string; className?: string }) {
  return (
    <Badge
      variant={reviewStatusBadgeVariant(status)}
      className={className}
      title={reviewStatusDescription(status)}
    >
      {reviewStatusLabel(status)}
    </Badge>
  );
}
