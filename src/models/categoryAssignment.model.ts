
export type ItemId = string;
export type CategoryId = string;

export const CategoryAssignmentStatus = {
  Unassigned: "unassigned",
  Assigned: "assigned",
} as const;

export type CategoryAssignmentStatus =
  (typeof CategoryAssignmentStatus)[keyof typeof CategoryAssignmentStatus];

export interface Category {
  readonly id: CategoryId;
  readonly label: string;
  readonly bgColorClassName?: string;
}

export interface CategoryItem {
  readonly id: ItemId;
  readonly name: string;
  readonly categoryId: CategoryId;
  /** Whether this item is currently assigned to its category. */
  readonly categoryAssignmentStatus: CategoryAssignmentStatus;
}

export interface RawItem {
  readonly type: string;
  readonly name: string;
}
