import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { AUTO_RETURN_MS } from "@/constants/config";

import { useItemAssignment } from "@/hooks/useItemAssignment.hook";

import type { RawItem } from "@/models/categoryAssignment.model";

describe("useItemAssignment", () => {
  const rawItems: RawItem[] = [
    {
      type: "fruit",
      name: "Apple",
    },
    {
      type: "vegetable",
      name: "Carrot",
    },
  ];

  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    act(() => {
      vi.clearAllTimers();
    });
  
    vi.useRealTimers();
  });

  it("should build categorized items from the provided raw items", () => {
    const { result } = renderHook(() => useItemAssignment(rawItems));

    expect(result.current.categorizedItems.unassignedItems).toHaveLength(2);

    expect(
      Object.values(result.current.categorizedItems.itemsByCategory).flat(),
    ).toHaveLength(0);
  });

  it("should move an item from unassigned items to its category when assign is called", () => {
    const { result } = renderHook(() => useItemAssignment(rawItems));

    const itemId =
      result.current.categorizedItems.unassignedItems[0]?.id;

    expect(itemId).toBeDefined();

    act(() => {
      result.current.assign(itemId!);
    });

    expect(
      result.current.categorizedItems.unassignedItems.some(
        (item) => item.id === itemId,
      ),
    ).toBe(false);

    expect(
      Object.values(result.current.categorizedItems.itemsByCategory)
        .flat()
        .some((item) => item.id === itemId),
    ).toBe(true);
  });

  it("should move an assigned item back to unassigned items when unassign is called", () => {
    const { result } = renderHook(() => useItemAssignment(rawItems));

    const itemId =
      result.current.categorizedItems.unassignedItems[0]?.id;

    act(() => {
      result.current.assign(itemId!);
    });

    act(() => {
      result.current.unassign(itemId!);
    });

    expect(
      result.current.categorizedItems.unassignedItems.some(
        (item) => item.id === itemId,
      ),
    ).toBe(true);

    expect(
      Object.values(result.current.categorizedItems.itemsByCategory)
        .flat()
        .some((item) => item.id === itemId),
    ).toBe(false);
  });

  it("should automatically unassign an item after the configured auto-return duration", () => {
    const { result } = renderHook(() => useItemAssignment(rawItems));

    const itemId =
      result.current.categorizedItems.unassignedItems[0]?.id;

    act(() => {
      result.current.assign(itemId!);
    });

    act(() => {
      vi.advanceTimersByTime(AUTO_RETURN_MS);
    });

    expect(
      result.current.categorizedItems.unassignedItems.some(
        (item) => item.id === itemId,
      ),
    ).toBe(true);
  });

  it("should cancel the pending auto-return timer when an item is manually unassigned", () => {
    const { result } = renderHook(() => useItemAssignment(rawItems));

    const itemId =
      result.current.categorizedItems.unassignedItems[0]?.id;

    act(() => {
      result.current.assign(itemId!);
    });

    act(() => {
      result.current.unassign(itemId!);
    });

    act(() => {
      vi.advanceTimersByTime(AUTO_RETURN_MS);
    });

    expect(
      result.current.categorizedItems.unassignedItems.some(
        (item) => item.id === itemId,
      ),
    ).toBe(true);
  });

  it("should manage auto-return timers independently for multiple assigned items", () => {
    const { result } = renderHook(() => useItemAssignment(rawItems));

    const [firstItem, secondItem] =
      result.current.categorizedItems.unassignedItems;

    act(() => {
      result.current.assign(firstItem.id);
    });

    act(() => {
      vi.advanceTimersByTime(1000);
    });

    act(() => {
      result.current.assign(secondItem.id);
    });

    act(() => {
      vi.advanceTimersByTime(AUTO_RETURN_MS - 1000);
    });

    expect(
      result.current.categorizedItems.unassignedItems.some(
        (item) => item.id === firstItem.id,
      ),
    ).toBe(true);

    expect(
      result.current.categorizedItems.unassignedItems.some(
        (item) => item.id === secondItem.id,
      ),
    ).toBe(false);

    act(() => {
      vi.advanceTimersByTime(1000);
    });

    expect(
      result.current.categorizedItems.unassignedItems.some(
        (item) => item.id === secondItem.id,
      ),
    ).toBe(true);
  });

  it("should keep assign and unassign callbacks stable across rerenders", () => {
    const { result, rerender } = renderHook(() =>
      useItemAssignment(rawItems),
    );

    const assignReference = result.current.assign;
    const unassignReference = result.current.unassign;

    rerender();

    expect(result.current.assign).toBe(assignReference);
    expect(result.current.unassign).toBe(unassignReference);
  });
});