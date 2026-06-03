// ── Types ────────────────────────────────────────────────────────────────
import type {
  CategoryItem,
  Category,
  CategoryId,
  ItemId,
  RawItem,
} from "@/models/categoryAssignment.model";

// ── Domain ───────────────────────────────────────────────────────────────
import { CategoryAssignmentStatus } from "@/models/categoryAssignment.model";

// ── Constants ──────────────────────────────────────────────────────────────
import { CATEGORY_BY_ID } from "@/constants/config";

/**
 * Pure prep work. Every function here is deterministic — same input, same
 * output, no side effects — like washing and chopping. That purity is what
 * makes this layer trivial to unit-test with Vitest, with zero React.
 */

// ── Stable id generation ───────────────────────────────────────────────────

let fallbackCounter = 0;

/**
 * Generate a stable, collision-resistant id. We never key React lists on a
 * name: two "Apple"s would collide and React would smear state across rows.
 */
export const createItemId = (): ItemId => {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  fallbackCounter += 1;
  return `item-${fallbackCounter}`;
};

// ── Boundary normalization (the back-door delivery inspection) ─────────────

/**
 * Turn UNTRUSTED raw items into trusted CategoryItems.
 *
 * Like a chef inspecting a supplier's crate at the back door: trim names, map
 * each raw "type" to a KNOWN category, and quietly drop anything unrecognised
 * rather than rendering arbitrary external strings into the UI. Validating at
 * the boundary lets every downstream layer trust its inputs completely.
 */
export const normalizeItems = (
  rawItems: readonly RawItem[],
): readonly CategoryItem[] => {
  const normalized: CategoryItem[] = [];

  for (const raw of rawItems) {
    const category = CATEGORY_BY_ID.get(raw.type.trim().toLowerCase());
    if (!category) continue; // unknown station → reject at the door

    normalized.push({
      id: createItemId(),
      name: raw.name.trim(),
      categoryId: category.id,
      categoryAssignmentStatus: CategoryAssignmentStatus.Unassigned,
    });
  }

  return normalized;
};

// ── State transforms ───────────────────────────────────────────────────────

/** Arguments for {@link reassignItem}. */
export interface ReassignItemArgs {
  /** The current list to derive a new list from. */
  readonly items: readonly CategoryItem[];
  /** Identifier of the item to reassign. */
  readonly itemId: ItemId;
  /** Assignment status the item should receive. */
  readonly assignmentStatus: CategoryAssignmentStatus;
}

/**
 * Return a NEW list with the specified item reassigned.
 *
 * The item is removed from its current position, updated with the new
 * assignment status, and appended to the end of the master list. Because
 * downstream grouping preserves order, the reassigned item naturally appears
 * at the bottom of its destination group without requiring per-group index
 * management.
 */
export const reassignItem = ({
  items,
  itemId,
  assignmentStatus,
}: ReassignItemArgs): readonly CategoryItem[] => {
  const target = items.find((item) => item.id === itemId);
  if (!target) {
    return items; // no-op keeps the same reference
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

// ── Derived views ───────────────────────────────────────────────────────────

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

/**
 * Sort the master rail into its columns in ONE pass (O(n)).
 *
 * The naive version walks the list once per column (O(n × columns)). With two
 * columns that's invisible; with 12 stations and thousands of tickets it is
 * not. A single pass into pre-seeded buckets scales the way a real line does:
 * one cook sorts the delivery crate once, dropping each item into its tray.
 *
 * Takes a single options object so future grouping options (e.g. a sort order
 * within columns) can be added without disturbing existing call sites.
 */
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
