import { memo } from "react";
import type { FC } from "react";

import type { CategoryItem, ItemId } from "@/models/categoryAssignment.model";

import CategoryListItem from "./CategoryListItem";

export interface CategoryListColumnProps {
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
        <header
          className={[
            "border-b border-neutral-200 px-4 py-3",
            "text-center text-base font-semibold",
            bgColorClassName ?? "bg-neutral-100/70",
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
