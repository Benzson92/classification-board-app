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
  it("normalizes category names regardless of case and trims item names", () => {
    const inputItems: RawItem[] = [
      { type: "Fruit", name: "  Apple  " },
      { type: "vegetable", name: "Carrot" },
    ];

    const normalizedItems = normalizeItems(inputItems);

    expect(normalizedItems).toHaveLength(2);
    expect(normalizedItems[0]).toMatchObject({
      name: "Apple",
      categoryId: "fruit",
      categoryAssignmentStatus: CategoryAssignmentStatus.Unassigned,
    });
    expect(normalizedItems[1]?.categoryId).toBe("vegetable");
  });

  it("filters out items whose category is not supported", () => {
    const inputItems: RawItem[] = [
      { type: "Fruit", name: "Apple" },
      { type: "Mineral", name: "Quartz" }, 
    ];

    const normalizedItems = normalizeItems(inputItems);

    expect(normalizedItems).toHaveLength(1);
    expect(normalizedItems[0]?.name).toBe("Apple");
  });

  it("generates a unique id for every normalized item", () => {
    const inputItems: RawItem[] = [
      { type: "Fruit", name: "Apple" },
      { type: "Fruit", name: "Apple" }, // same name, must not collide
    ];

    const [first, second] = normalizeItems(inputItems);

    expect(first?.id).toBeDefined();
    expect(first?.id).not.toBe(second?.id);
  });
});

describe("reassignItem", () => {
  const initialItems: CategoryItem[] = [
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

  it("moves the assigned item to the end of the list and updates its assignment status", () => {
    const updatedItems = reassignItem({
      items: initialItems,
      itemId: "a",
      assignmentStatus: CategoryAssignmentStatus.Assigned,
    });

    expect(updatedItems.map((item) => item.id)).toEqual(["b", "c", "a"]);
    expect(updatedItems.at(-1)?.categoryAssignmentStatus).toBe(
      CategoryAssignmentStatus.Assigned,
    );
  });

  it("returns the original array when the target item does not exist", () => {
    const updatedItems = reassignItem({
      items: initialItems,
      itemId: "missing",
      assignmentStatus: CategoryAssignmentStatus.Assigned,
    });
    expect(updatedItems).toBe(initialItems);
  });

  it("does not mutate the input array", () => {
    const snapshot = [...initialItems];
    reassignItem({
      items: initialItems,
      itemId: "a",
      assignmentStatus: CategoryAssignmentStatus.Assigned,
    });
    expect(initialItems).toEqual(snapshot);
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

  it("initializes every configured category even when it contains no items", () => {
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

  it("generates sequential fallback ids when crypto.randomUUID is unavailable", () => {
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