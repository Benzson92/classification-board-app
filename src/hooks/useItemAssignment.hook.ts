import { useCallback, useMemo, useReducer } from "react";

import type { CategorizedItems } from "@/utils/categoryAssignment.util";
import type { ItemId, RawItem } from "@/models/categoryAssignment.model";

import { AUTO_RETURN_MS, CATEGORIES } from "@/constants/config";
import { ItemAssignmentActionType } from "@/constants/itemAssignmentAction.constant";

import {
  buildCategorizedItems,
  normalizeItems,
} from "@/utils/categoryAssignment.util";

import { itemAssignmentReducer } from "@/reducers/itemAssignment.reducer";

import { useTimerRegistry } from "@/hooks/useTimerRegistry.hook";

export interface UseItemAssignmentResult {
  readonly categorizedItems: CategorizedItems;
  readonly assign: (id: ItemId) => void;
  readonly unassign: (id: ItemId) => void;
}

export const useItemAssignment = (
  rawItems: readonly RawItem[],
): UseItemAssignmentResult => {
  const [items, dispatch] = useReducer(
    itemAssignmentReducer,
    rawItems,
    normalizeItems,
  );

  const timers = useTimerRegistry<ItemId>();

  const unassign = useCallback(
    (id: ItemId) => {
      timers.clear(id); // cancel any pending auto-return → immediate

      dispatch({ type: ItemAssignmentActionType.UnassignItem, itemId: id });
    },
    [timers],
  );

  const assign = useCallback(
    (id: ItemId) => {
      dispatch({ type: ItemAssignmentActionType.AssignItem, itemId: id });

      // Arm the 5-second walk-back. The timer self-cleans, so manual unassigns
      // and auto-unassigns can never double-fire on the same item.
      timers.set(
        id,
        () =>
          dispatch({ type: ItemAssignmentActionType.UnassignItem, itemId: id }),
        AUTO_RETURN_MS,
      );
    },
    [timers],
  );

  // Derive the categorized items once per state change — a single O(n) pass, memoized.
  const categorizedItems = useMemo(
    () => buildCategorizedItems({ items, categories: CATEGORIES }),
    [items],
  );

  return { categorizedItems, assign, unassign };
};
