// ── React ────────────────────────────────────────────────────────────────
import { useCallback, useEffect, useMemo, useRef } from "react";

/**
 * A reusable registry of keyed timeouts with automatic cleanup.
 *
 * The pass's row of egg timers: each plate gets its own timer, you can cancel
 * any single one, setting a new timer for a plate replaces the old one, and
 * when the kitchen closes (unmount) every timer is cleared so none rings into
 * an empty room. Feature-agnostic — reuse it for toasts, polling, autosave.
 */
export interface TimerRegistry<TKey> {
  /** Arm (or replace) a timer for `key`, firing `callback` after `delayMs`. */
  readonly set: (key: TKey, callback: () => void, delayMs: number) => void;
  /** Cancel the pending timer for `key`, if any. Safe to call repeatedly. */
  readonly clear: (key: TKey) => void;
}

export function useTimerRegistry<TKey>(): TimerRegistry<TKey> {
  const timers = useRef<Map<TKey, ReturnType<typeof setTimeout>>>(new Map());

  const clear = useCallback((key: TKey) => {
    const id = timers.current.get(key);
    if (id !== undefined) {
      clearTimeout(id);
      timers.current.delete(key);
    }
  }, []);

  const set = useCallback(
    (key: TKey, callback: () => void, delayMs: number) => {
      // Never stack two timers on one key.
      const existing = timers.current.get(key);
      if (existing !== undefined) clearTimeout(existing);

      const id = setTimeout(() => {
        timers.current.delete(key); // self-clean before firing
        callback();
      }, delayMs);

      timers.current.set(key, id);
    },
    [],
  );

  // Close the kitchen: clear everything on unmount.
  useEffect(() => {
    const registry = timers.current;
    return () => {
      registry.forEach(clearTimeout);
      registry.clear();
    };
  }, []);

  // Stable object identity so consumers' useCallback deps don't churn.
  return useMemo<TimerRegistry<TKey>>(() => ({ set, clear }), [set, clear]);
}
