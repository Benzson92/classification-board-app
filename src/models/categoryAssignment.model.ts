/**
 * Domain model for the CategoryList feature.
 *
 * The kitchen's spec sheet: before anyone picks up a knife, the brigade agrees
 * on exactly what an ingredient ticket looks like and which states it can be
 * in. Encoding the rules here lets the compiler enforce them — illegal states
 * become impossible to write down.
 */

/** Stable, collision-resistant identifier for a board item. */
export type ItemId = string;

/** Identifier for a category column, e.g. "fruit" or "vegetable". */
export type CategoryId = string;

/**
 * Whether an item has been assigned to its category yet.
 *
 * An item is either Unassigned (sitting in the staging list) or Assigned (at
 * its own category station) — never in the "wrong" column. Modelling this as a
 * two-value union (rather than an arbitrary column id) makes that illegal state
 * impossible to represent: the type system becomes a second pair of eyes.
 */
export const CategoryAssignmentStatus = {
  Unassigned: "unassigned",
  Assigned: "assigned",
} as const;

export type CategoryAssignmentStatus =
  (typeof CategoryAssignmentStatus)[keyof typeof CategoryAssignmentStatus];

/** A category column definition used to render the board. */
export interface Category {
  readonly id: CategoryId;
  readonly label: string;
  readonly bgColorClassName?: string;
}

/** The canonical, trusted item shape used everywhere INSIDE the feature. */
export interface CategoryItem {
  readonly id: ItemId;
  readonly name: string;
  /** The item's true home category (its station). */
  readonly categoryId: CategoryId;
  /** Whether this item is currently assigned to its category. */
  readonly categoryAssignmentStatus: CategoryAssignmentStatus;
}

/**
 * The raw, UNTRUSTED item shape as it arrives from outside (API, seed, CMS).
 * Never allowed past the boundary normalizer in categoryList.util.ts.
 */
export interface RawItem {
  readonly type: string;
  readonly name: string;
}
