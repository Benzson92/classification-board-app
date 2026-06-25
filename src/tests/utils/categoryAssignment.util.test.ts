import { describe, expect, it, afterEach } from "vitest";

import type { CategoryItem, RawItem } from "@/models/categoryAssignment.model";
import { CategoryAssignmentStatus } from "@/models/categoryAssignment.model";

import { CATEGORIES } from "@/constants/config";

import {
  buildCategorizedItems,
  normalizeItems,
  reassignItem,
} from "@/utils/categoryAssignment.util";

describe("normalizeItems", () => {
  it("maps known types case-insensitively and trims names", () => {
    const raw: RawItem[] = [
      { type: "Fruit", name: "  Apple  " },
      { type: "vegetable", name: "Carrot" },
    ];

    const result = normalizeItems(raw);

    expect(result).toHaveLength(2);
    expect(result[0]).toMatchObject({
      name: "Apple",
      categoryId: "fruit",
      categoryAssignmentStatus: CategoryAssignmentStatus.Unassigned,
    });
    expect(result[1]?.categoryId).toBe("vegetable");
  });

  it("drops unknown categories at the boundary", () => {
    const raw: RawItem[] = [
      { type: "Fruit", name: "Apple" },
      { type: "Mineral", name: "Quartz" }, // unknown station → rejected
    ];

    const result = normalizeItems(raw);

    expect(result).toHaveLength(1);
    expect(result[0]?.name).toBe("Apple");
  });

  it("assigns unique ids", () => {
    const raw: RawItem[] = [
      { type: "Fruit", name: "Apple" },
      { type: "Fruit", name: "Apple" }, // same name, must not collide
    ];

    const [first, second] = normalizeItems(raw);

    expect(first?.id).toBeDefined();
    expect(first?.id).not.toBe(second?.id);
  });
});

describe("reassignItem", () => {
  const base: CategoryItem[] = [
    {
      id: "a",
      name: "Apple",
      categoryId: "fruit",
      categoryAssignmentStatus: CategoryAssignmentStatus.Unassigned,
    },
    {
      id: "b",
      name: "Carrot",
      categoryId: "vegetable",
      categoryAssignmentStatus: CategoryAssignmentStatus.Unassigned,
    },
    {
      id: "c",
      name: "Mango",
      categoryId: "fruit",
      categoryAssignmentStatus: CategoryAssignmentStatus.Unassigned,
    },
  ];

  it("moves the target to the end and updates its status", () => {
    const result = reassignItem({
      items: base,
      itemId: "a",
      assignmentStatus: CategoryAssignmentStatus.Assigned,
    });

    expect(result.map((item) => item.id)).toEqual(["b", "c", "a"]);
    expect(result.at(-1)?.categoryAssignmentStatus).toBe(
      CategoryAssignmentStatus.Assigned,
    );
  });

  it("returns the SAME reference when the id is not found (no needless re-render)", () => {
    const result = reassignItem({
      items: base,
      itemId: "missing",
      assignmentStatus: CategoryAssignmentStatus.Assigned,
    });
    expect(result).toBe(base);
  });

  it("does not mutate the input array", () => {
    const snapshot = [...base];
    reassignItem({
      items: base,
      itemId: "a",
      assignmentStatus: CategoryAssignmentStatus.Assigned,
    });
    expect(base).toEqual(snapshot);
  });
});

describe("buildCategorizedItems", () => {
  it("splits unassigned from categorized items and preserves order within each", () => {
    const items: CategoryItem[] = [
      {
        id: "a",
        name: "Apple",
        categoryId: "fruit",
        categoryAssignmentStatus: CategoryAssignmentStatus.Assigned,
      },
      {
        id: "b",
        name: "Carrot",
        categoryId: "vegetable",
        categoryAssignmentStatus: CategoryAssignmentStatus.Unassigned,
      },
      {
        id: "c",
        name: "Mango",
        categoryId: "fruit",
        categoryAssignmentStatus: CategoryAssignmentStatus.Assigned,
      },
    ];

    const { unassignedItems, itemsByCategory } = buildCategorizedItems({
      items,
      categories: CATEGORIES,
    });

    expect(unassignedItems.map((i) => i.id)).toEqual(["b"]);
    expect(itemsByCategory.fruit?.map((i) => i.id)).toEqual(["a", "c"]); // order kept
    expect(itemsByCategory.vegetable).toEqual([]);
  });

  it("pre-seeds every known category so empty columns still exist", () => {
    const { itemsByCategory } = buildCategorizedItems({
      items: [],
      categories: CATEGORIES,
    });
    expect(Object.keys(itemsByCategory).sort()).toEqual(["fruit", "vegetable"]);
  });
});

describe("createItemId fallback", () => {
  const originalCrypto = globalThis.crypto;

  afterEach(() => {
    Object.defineProperty(globalThis, "crypto", {
      value: originalCrypto,
      configurable: true,
    });
  });

  it("uses the fallback id generator when randomUUID is unavailable", () => {
    Object.defineProperty(globalThis, "crypto", {
      value: {},
      configurable: true,
    });

    const result = normalizeItems([
      { type: "Fruit", name: "Apple" },
      { type: "Fruit", name: "Banana" },
    ]);

    expect(result[0]?.id).toMatch(/^item-\d+$/);
    expect(result[1]?.id).toMatch(/^item-\d+$/);
    expect(result[0]?.id).not.toBe(result[1]?.id);
  });
});