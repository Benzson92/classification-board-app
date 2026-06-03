import type { Category, CategoryId } from "@/models/categoryAssignment.model";

/** How long an assigned item lingers at its station before auto-returning. */
export const AUTO_RETURN_MS = 5_000;

export const CATEGORIES: readonly Category[] = [
  { id: "fruit", label: "Fruit", bgColorClassName: "bg-orange-700" },
  { id: "vegetable", label: "Vegetable", bgColorClassName: "bg-green-700" },
] as const;

/** Fast O(1) lookup from a CategoryId to its definition, built once. */
export const CATEGORY_BY_ID: ReadonlyMap<CategoryId, Category> = new Map(
  CATEGORIES.map((category) => [category.id, category]),
);
