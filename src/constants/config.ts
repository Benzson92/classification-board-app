// ── Types ────────────────────────────────────────────────────────────────
import type { Category, CategoryId } from "@/models/categoryAssignment.model";

/**
 * Tunable kitchen timers and the station registry.
 *
 * Everything a product manager might reasonably change lives here — never
 * buried in component code. This is the single knob panel.
 */

/** How long an assigned item lingers at its station before auto-returning. */
export const AUTO_RETURN_MS = 5_000;

/**
 * The category registry: single source of truth for which columns exist, their
 * order on screen, and their labels.
 *
 * Want a third station ("Grain", "Dairy")? Add one line here. The board,
 * grouping, and rendering all adapt — no other file changes.
 */
export const CATEGORIES: readonly Category[] = [
  { id: "fruit", label: "Fruit", bgColorClassName:'bg-orange-700' },
  { id: "vegetable", label: "Vegetable",bgColorClassName:'bg-green-700' },
] as const;

/** Fast O(1) lookup from a CategoryId to its definition, built once. */
export const CATEGORY_BY_ID: ReadonlyMap<CategoryId, Category> =
  new Map(CATEGORIES.map((category) => [category.id, category]));