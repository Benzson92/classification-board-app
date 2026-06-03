import type { FC } from "react";

import type { RawItem } from "@/models/categoryAssignment.model";
import { CATEGORIES } from "@/constants/config";
import { useItemAssignment } from "@/hooks/useItemAssignment.hook";

import CategoryListColumn from "./CategoryListColumn";

export interface CategoryListProps {
  readonly items: readonly RawItem[];
}

const CategoryList: FC<CategoryListProps> = ({ items }) => {
  const { categorizedItems, assign, unassign } = useItemAssignment(items);

  return (
    <div className="min-h-screen w-full bg-neutral-50 p-6 font-sans text-neutral-800">
      <div className="mx-auto flex max-w-7xl flex-wrap gap-6 flex-col sm:flex-row">
        {/* Unassigned list — headerless, click to assign. */}
        <div className="min-w-70 flex-1">
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
              className="min-w-70 flex-1 flex flex-col"
            >
              <CategoryListColumn
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
