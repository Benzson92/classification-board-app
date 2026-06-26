import type {
  CategoryItem,
  Category,
  CategoryId,
  ItemId,
  RawItem,
} from "@/models/categoryAssignment.model";
import { CategoryAssignmentStatus } from "@/models/categoryAssignment.model";

import { CATEGORY_BY_ID } from "@/constants/config";

let fallbackCounter = 0;

export const createItemId = (): ItemId => {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  fallbackCounter += 1;
  return `item-${fallbackCounter}`;
};

export const normalizeItems = (
  rawItems: readonly RawItem[],
): readonly CategoryItem[] => {
  const normalizedItems: CategoryItem[] = [];

  for (const rawItem of rawItems) {
    const category = CATEGORY_BY_ID.get(rawItem.type.trim().toLowerCase());
    if (!category) continue; 

    normalizedItems.push({
      id: createItemId(),
      name: rawItem.name.trim(),
      categoryId: category.id,
      categoryAssignmentStatus: CategoryAssignmentStatus.Unassigned,
    });
  }

  return normalizedItems;
};

/** Arguments for {@link reassignItem}. */
export interface ReassignItemArgs {
  /** The current list to derive a new list from. */
  readonly items: readonly CategoryItem[];
  /** Identifier of the item to reassign. */
  readonly itemId: ItemId;
  /** Assignment status the item should receive. */
  readonly assignmentStatus: CategoryAssignmentStatus;
}

export const reassignItem = ({
  items,
  itemId,
  assignmentStatus,
}: ReassignItemArgs): readonly CategoryItem[] => {
  const target = items.find((item) => item.id === itemId);
  if (!target) {
    return items;
  }

  const remainingItems = items.filter((item) => item.id !== itemId);
  return [
    ...remainingItems,
    {
      ...target,
      categoryAssignmentStatus: assignmentStatus,
    },
  ];
};

export interface CategorizedItems {
  readonly unassignedItems: readonly CategoryItem[];
  readonly itemsByCategory: Readonly<
    Record<CategoryId, readonly CategoryItem[]>
  >;
}

/** Arguments for {@link buildCategorizedItems}. */
export interface BuildCategorizedItemsArgs {
  /** The flat master list to sort into columns. */
  readonly items: readonly CategoryItem[];
  /** Known categories; used to pre-seed buckets so empty columns still render. */
  readonly categories: readonly Category[];
}

export const buildCategorizedItems = ({
  items,
  categories,
}: BuildCategorizedItemsArgs): CategorizedItems => {
  const unassignedItems: CategoryItem[] = [];
  const itemsByCategory: Record<CategoryId, CategoryItem[]> = {};

  // Pre-seed every known station so empty columns still render.
  for (const category of categories) {
    itemsByCategory[category.id] = [];
  }

  for (const item of items) {
    if (item.categoryAssignmentStatus === CategoryAssignmentStatus.Unassigned) {
      unassignedItems.push(item);
      continue;
    }
    itemsByCategory[item.categoryId]?.push(item);
  }

  return { unassignedItems, itemsByCategory };
};
