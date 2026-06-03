import { useCallback, useEffect, useMemo, useRef } from "react";

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
