// ── React ────────────────────────────────────────────────────────────────
import { memo } from "react";
import type { FC } from "react";

// ── Types ────────────────────────────────────────────────────────────────
import type { CategoryItem, ItemId } from "@/models/categoryAssignment.model";

// ── Components ───────────────────────────────────────────────────────────
import CategoryListItem from "./CategoryListItem";

/**
 * One column on the board. Deliberately generic: the SAME component renders the
 * staging list (no header, no countdown) and every category station (header +
 * countdown). Reuse beats three near-identical column components that drift
 * apart over time.
 */
export interface CategoryListColumnProps {
  /** Omit for the headerless staging list; provide for category stations. */
  readonly title?: string;
  readonly bgColorClassName?: string;
  readonly items: readonly CategoryItem[];
  readonly onItemActivate: (id: ItemId) => void;
  readonly showCountdown?: boolean;
  readonly emptyHint?: string;
}

const CategoryListColumnBase: FC<CategoryListColumnProps> = ({
  title,
  bgColorClassName,
  items,
  onItemActivate,
  showCountdown = false,
  emptyHint,
}) => {
  const hasHeader = title !== undefined;

  return (
    <section
      className={
        hasHeader
          ? "rounded-xl border border-neutral-200 bg-white grow overflow-hidden"
          : "flex flex-col gap-3"
      }
    >
      {hasHeader && (
        // <header
        //   className="rounded-t-xl border-b border-neutral-200 bg-neutral-100/70
        //              px-4 py-3 text-center text-base font-semibold text-neutral-800"
        // >
        <header
          className={[
            // Static layout/shape — never changes:
            "border-b border-neutral-200 px-4 py-3",
            "text-center text-base font-semibold",
            // Variable: the category's colour, or fall back to neutral:
            bgColorClassName ?? "bg-neutral-100/70",
            // Light text reads cleanly on a saturated -600 banner; dark text on the neutral fallback:
            bgColorClassName ? "text-white" : "text-neutral-800",
          ].join(" ")}
        >
          {title}
        </header>
      )}

      <div
        className={hasHeader ? "flex min-h-30 flex-col gap-3 p-3" : "contents"}
      >
        {items.length === 0 && emptyHint && (
          <p className="px-2 py-3 text-center text-sm text-neutral-400">
            {emptyHint}
          </p>
        )}

        {items.map((item) => (
          <CategoryListItem
            key={item.id}
            id={item.id}
            label={item.name}
            onActivate={onItemActivate}
            showCountdown={showCountdown}
            bgColorClassName={bgColorClassName}
          />
        ))}
      </div>
    </section>
  );
};

const CategoryListColumn = memo(CategoryListColumnBase);
CategoryListColumn.displayName = "CategoryListColumn";

export default CategoryListColumn;
