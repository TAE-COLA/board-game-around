import { useCallback, useState } from 'react';

export const useSideEffectQueue = <TEffect,>() => {
  const [sideEffects, setSideEffects] = useState<TEffect[]>([]);

  const pushSideEffect = useCallback((...effects: TEffect[]) => {
    setSideEffects((prev) => [...prev, ...effects.filter(Boolean)]);
  }, []);

  const clearSideEffects = useCallback(() => {
    setSideEffects([]);
  }, []);

  return { clearSideEffects, pushSideEffect, sideEffects };
};
