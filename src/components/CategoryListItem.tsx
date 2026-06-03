// ── React ────────────────────────────────────────────────────────────────
import { memo } from "react";
import type { FC } from "react";

// ── Types ────────────────────────────────────────────────────────────────
import type { ItemId } from "@/models/categoryAssignment.model";

// ── Config ───────────────────────────────────────────────────────────────
import { AUTO_RETURN_MS } from "@/constants/config";

/**
 * A single clickable ticket. Pure presentation — it knows nothing about timers
 * or board state; it renders a label and reports clicks by id.
 *
 * It takes `id` + a stable `onActivate(id)` (rather than a pre-bound closure)
 * so React.memo actually works: moving one ticket never re-renders the others.
 * On a board of thousands, that's the difference between a snappy click and a
 * visible stutter.
 */
export interface CategoryListItemProps {
  readonly id: ItemId;
  readonly label: string;
  readonly onActivate: (id: ItemId) => void;
  /** When true, shows the draining auto-return countdown bar. */
  readonly showCountdown?: boolean;
  readonly bgColorClassName?: string;
}

const CategoryListItemBase: FC<CategoryListItemProps> = ({
  id,
  label,
  onActivate,
  showCountdown = false,
  bgColorClassName,
}) => {
  return (
    <button
      type="button"
      onClick={() => onActivate(id)}
      title={showCountdown ? "Click to send back to the list" : undefined}
      className="relative w-full overflow-hidden rounded-lg border border-neutral-200
                 bg-white px-4 py-4 text-center text-neutral-800 transition-colors
                 hover:border-neutral-400 hover:bg-neutral-50 active:scale-[0.99]"
    >
      {label}
      {showCountdown && (
        <span
          aria-hidden
          // className="absolute bottom-0 left-0 h-1 w-full origin-left bg-neutral-300"
          className={`absolute bottom-0 left-0 h-1 w-full origin-left ${
            bgColorClassName ?? "bg-neutral-300"
          }`}
          style={{ animation: `cb-shrink ${AUTO_RETURN_MS}ms linear forwards` }}
        />
      )}
    </button>
  );
};

const CategoryListItem = memo(CategoryListItemBase);
CategoryListItem.displayName = "CategoryListItem";

export default CategoryListItem;
