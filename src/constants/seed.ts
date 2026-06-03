// ── Types ────────────────────────────────────────────────────────────────
import type { RawItem } from "@/models/categoryAssignment.model";

/**
 * Seed data for the board.
 *
 * Static, in-repo data — so it's a plain constant, not a fake fetch. The board
 * receives this through its `items` prop (it never imports this file itself),
 * which keeps the component reusable and testable with any dataset. If a real
 * endpoint is ever added, reintroduce an async data layer then and only the
 * route changes — the board's prop boundary stays identical.
 */
export const SEED_ITEMS: readonly RawItem[] = [
  { type: "Fruit", name: "Apple" },
  { type: "Vegetable", name: "Broccoli" },
  { type: "Vegetable", name: "Mushroom" },
  { type: "Fruit", name: "Banana" },
  { type: "Vegetable", name: "Tomato" },
  { type: "Fruit", name: "Orange" },
  { type: "Fruit", name: "Mango" },
  { type: "Fruit", name: "Pineapple" },
  { type: "Vegetable", name: "Cucumber" },
  { type: "Fruit", name: "Watermelon" },
  { type: "Vegetable", name: "Carrot" },
];
