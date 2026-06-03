// ── React ────────────────────────────────────────────────────────────────
import type { FC } from "react";

// ── Types ────────────────────────────────────────────────────────────────
import type { RawItem } from "@/models/categoryAssignment.model";

// ── Config ───────────────────────────────────────────────────────────────
import { CATEGORIES } from "@/constants/config";

// ── Hooks ────────────────────────────────────────────────────────────────
import { useItemAssignment } from "@/hooks/useItemAssignment.hook";

// ── Components ───────────────────────────────────────────────────────────
import CategoryListColumn from "./CategoryListColumn";

/**
 * The dining room: assembles the staging list plus one column per registered
 * category. It MAPS over CATEGORIES rather than hardcoding Fruit and Vegetable,
 * so the board is fully data-driven — add a station in config.ts and a new
 * column appears here with zero edits to this file.
 */
export interface CategoryListProps {
  readonly items: readonly RawItem[];
}

const CategoryList: FC<CategoryListProps> = ({ items }) => {
  const { categorizedItems, assign, unassign } = useItemAssignment(items);

  return (
    <div className="min-h-screen w-full bg-neutral-50 p-6 font-sans text-neutral-800">
      {/* <div
        className="mx-auto grid max-w-5xl gap-6"
        style={{
          gridTemplateColumns: `repeat(${CATEGORIES.length + 1}, minmax(0, 1fr))`,
        }}
      > */}
          <div className="mx-auto flex max-w-7xl flex-wrap gap-6 flex-col sm:flex-row">
    {/* Unassigned list — headerless, click to assign. */}
    <div className="min-w-[280px] flex-1">
        <CategoryListColumn
          items={categorizedItems.unassignedItems}
          onItemActivate={assign}
          emptyHint="Everything is plated — waiting for items to return."
        />
        </div>

<div className="flex flex-col flex-1 gap-6 order-first sm:order-last lg:flex-row lg:flex-2">
        {/* One column per registered category — click to return immediately. */}
        {CATEGORIES.map((category) => (
          <div
          key={category.id}
          className="min-w-[280px] flex-1 flex flex-col"
        >
          <CategoryListColumn
            // key={category.id}
            title={category.label}
            bgColorClassName={category?.bgColorClassName}
            items={categorizedItems.itemsByCategory[category.id] ?? []}
            onItemActivate={unassign}
            showCountdown
            emptyHint={`No ${category.label.toLowerCase()} yet.`}
          />
                </div>
  ))}
  </div>
      </div>
    </div>
  );
};

export default CategoryList;
