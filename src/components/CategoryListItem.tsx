import { memo } from "react";
import type { FC } from "react";

import type { ItemId } from "@/models/categoryAssignment.model";
import { AUTO_RETURN_MS } from "@/constants/config";

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
