import type { CategoryItem, ItemId } from "@/models/categoryAssignment.model";
import { CategoryAssignmentStatus } from "@/models/categoryAssignment.model";

import { ItemAssignmentActionType } from "@/constants/itemAssignmentAction.constant";

import { reassignItem } from "@/utils/categoryAssignment.util";

export type ItemAssignmentState = readonly CategoryItem[];

export type ItemAssignmentAction =
  | {
      readonly type: typeof ItemAssignmentActionType.AssignItem;
      readonly itemId: ItemId;
    }
  | {
      readonly type: typeof ItemAssignmentActionType.UnassignItem;
      readonly itemId: ItemId;
    };

export const itemAssignmentReducer = (
  state: ItemAssignmentState,
  action: ItemAssignmentAction,
): ItemAssignmentState => {
  switch (action.type) {
    case ItemAssignmentActionType.AssignItem:
      return reassignItem({
        items: state,
        itemId: action.itemId,
        assignmentStatus: CategoryAssignmentStatus.Assigned,
      });

    case ItemAssignmentActionType.UnassignItem:
      return reassignItem({
        items: state,
        itemId: action.itemId,
        assignmentStatus: CategoryAssignmentStatus.Unassigned,
      });

    default:
      return assertNever(action);
  }
};

const assertNever = (action: never): never => {
  throw new Error(
    `Unhandled item assignment action: ${JSON.stringify(action)}`,
  );
};
