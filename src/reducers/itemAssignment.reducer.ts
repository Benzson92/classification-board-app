// ── Types ────────────────────────────────────────────────────────────────
import type { CategoryItem, ItemId } from "@/models/categoryAssignment.model";

// ── Domain ───────────────────────────────────────────────────────────────
import { CategoryAssignmentStatus } from "@/models/categoryAssignment.model";

import { ItemAssignmentActionType } from "@/constants/itemAssignmentAction.constant";

// ── Logic ────────────────────────────────────────────────────────────────
import { reassignItem } from "@/utils/categoryAssignment.util";

/**
 * The kitchen's Standard Operating Procedure.
 *
 * Every change to the master list flows through this one reducer. Components
 * never mutate state directly — they describe WHAT happened ("ASSIGN_ITEM",
 * "UNASSIGN_ITEM") and the reducer decides HOW the list changes. That single
 * chokepoint makes the feature predictable and the transitions trivial to test.
 */

export type ItemAssignmentState = readonly CategoryItem[];

/** Every legal change to the item assignment state, expressed as plain data. */
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

/**
 * Exhaustiveness guard. If a teammate adds an action to the union but forgets
 * to handle it here, `action` is no longer `never` and the build FAILS at
 * compile time. The throw is just a runtime backstop for impossible states —
 * the real protection is the type error you get before shipping.
 */
const assertNever = (action: never): never => {
  throw new Error(
    `Unhandled item assignment action: ${JSON.stringify(action)}`,
  );
};