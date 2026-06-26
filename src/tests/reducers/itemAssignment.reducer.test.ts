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
  it("should mark the item as assigned and move it to the end of the collection when ASSIGN_ITEM is dispatched", () => {
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

  it("should mark the item as unassigned and move it back to the end of the collection when UNASSIGN_ITEM is dispatched", () => {
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

  it("should return a new state without mutating the previous state", () => {
    const snapshot = JSON.stringify(initial);

    itemAssignmentReducer(initial, {
      type: "ASSIGN_ITEM",
      itemId: "a",
    });

    expect(JSON.stringify(initial)).toBe(snapshot);
  });

  it("should throw an error when an unsupported action type is dispatched", () => {
    expect(() =>
      itemAssignmentReducer(initial, {
        type: "UNKNOWN_ACTION",
      } as never),
    ).toThrow(
      'Unhandled item assignment action: {"type":"UNKNOWN_ACTION"}',
    );
  });
});