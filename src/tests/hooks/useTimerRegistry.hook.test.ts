import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { useTimerRegistry } from "@/hooks/useTimerRegistry.hook";

describe("useTimerRegistry", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.clearAllTimers();
    vi.useRealTimers();
  });

  it("executes the callback after the specified delay", () => {
    const callback = vi.fn();

    const { result } = renderHook(() => useTimerRegistry<string>());

    act(() => {
      result.current.set("item-1", callback, 1_000);
    });

    expect(callback).not.toHaveBeenCalled();

    act(() => {
      vi.advanceTimersByTime(1_000);
    });

    expect(callback).toHaveBeenCalledTimes(1);
  });

  it("replaces an existing timer when the same key is registered again", () => {
    const firstCallback = vi.fn();
    const secondCallback = vi.fn();

    const { result } = renderHook(() => useTimerRegistry<string>());

    act(() => {
      result.current.set("item-1", firstCallback, 1_000);
      result.current.set("item-1", secondCallback, 2_000);
    });

    act(() => {
      vi.advanceTimersByTime(1_000);
    });

    expect(firstCallback).not.toHaveBeenCalled();
    expect(secondCallback).not.toHaveBeenCalled();

    act(() => {
      vi.advanceTimersByTime(1_000);
    });

    expect(firstCallback).not.toHaveBeenCalled();
    expect(secondCallback).toHaveBeenCalledTimes(1);
  });

  it("cancels a timer for a specific key", () => {
    const callback = vi.fn();

    const { result } = renderHook(() => useTimerRegistry<string>());

    act(() => {
      result.current.set("item-1", callback, 1_000);
      result.current.clear("item-1");
    });

    act(() => {
      vi.advanceTimersByTime(1_000);
    });

    expect(callback).not.toHaveBeenCalled();
  });

  it("does not affect timers registered under different keys", () => {
    const firstCallback = vi.fn();
    const secondCallback = vi.fn();

    const { result } = renderHook(() => useTimerRegistry<string>());

    act(() => {
      result.current.set("item-1", firstCallback, 1_000);
      result.current.set("item-2", secondCallback, 1_000);

      result.current.clear("item-1");
    });

    act(() => {
      vi.advanceTimersByTime(1_000);
    });

    expect(firstCallback).not.toHaveBeenCalled();
    expect(secondCallback).toHaveBeenCalledTimes(1);
  });

  it("allows clear to be called multiple times safely", () => {
    const callback = vi.fn();

    const { result } = renderHook(() => useTimerRegistry<string>());

    act(() => {
      result.current.set("item-1", callback, 1_000);

      result.current.clear("item-1");
      result.current.clear("item-1");
      result.current.clear("item-1");
    });

    act(() => {
      vi.advanceTimersByTime(1_000);
    });

    expect(callback).not.toHaveBeenCalled();
  });

  it("cleans up all timers when the hook unmounts", () => {
    const firstCallback = vi.fn();
    const secondCallback = vi.fn();

    const { result, unmount } = renderHook(() =>
      useTimerRegistry<string>(),
    );

    act(() => {
      result.current.set("item-1", firstCallback, 1_000);
      result.current.set("item-2", secondCallback, 2_000);
    });

    unmount();

    act(() => {
      vi.runAllTimers();
    });

    expect(firstCallback).not.toHaveBeenCalled();
    expect(secondCallback).not.toHaveBeenCalled();
  });

  it("returns stable function references across rerenders", () => {
    const { result, rerender } = renderHook(() =>
      useTimerRegistry<string>(),
    );

    const initialSet = result.current.set;
    const initialClear = result.current.clear;

    rerender();

    expect(result.current.set).toBe(initialSet);
    expect(result.current.clear).toBe(initialClear);
  });

  it("returns a stable registry object across rerenders", () => {
    const { result, rerender } = renderHook(() =>
      useTimerRegistry<string>(),
    );

    const initialRegistry = result.current;

    rerender();

    expect(result.current).toBe(initialRegistry);
  });
});