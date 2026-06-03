import { describe, expect, it } from "vitest";

import type { ItemAssignmentState } from "@/reducers/itemAssignment.reducer";
import { itemAssignmentReducer } from "@/reducers/itemAssignment.reducer";

import { CategoryAssignmentStatus } from "@/models/categoryAssignment.model";

const initial: ItemAssignmentState = [
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
];

describe("itemAssignmentReducer", () => {
  it("ASSIGN places the item and sends it to the end", () => {
    const next = itemAssignmentReducer(initial, {
      type: "ASSIGN_ITEM",
      itemId: "a",
    });

    expect(next.map((i) => i.id)).toEqual(["b", "a"]);
    expect(next.at(-1)).toMatchObject({
      id: "a",
      categoryAssignmentStatus: CategoryAssignmentStatus.Assigned,
    });
  });

  it("RETURN places the item back to staging at the end", () => {
    const assigned = itemAssignmentReducer(initial, {
      type: "ASSIGN_ITEM",
      itemId: "a",
    });
    const returned = itemAssignmentReducer(assigned, {
      type: "UNASSIGN_ITEM",
      itemId: "a",
    });

    expect(returned.at(-1)).toMatchObject({
      id: "a",
      categoryAssignmentStatus: CategoryAssignmentStatus.Unassigned,
    });
  });

  it("is immutable — never mutates prior state", () => {
    const snapshot = JSON.stringify(initial);
    itemAssignmentReducer(initial, { type: "ASSIGN_ITEM", itemId: "a" });
    expect(JSON.stringify(initial)).toBe(snapshot);
  });
});
