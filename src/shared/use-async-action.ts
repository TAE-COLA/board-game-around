import { useCallback, useMemo, useRef, useState } from 'react';

type PendingMap<TAction extends string> = Partial<Record<TAction, boolean>>;

export const useAsyncAction = <TAction extends string>() => {
  const pendingRef = useRef<PendingMap<TAction>>({});
  const [pending, setPending] = useState<PendingMap<TAction>>({});

  const setActionPending = useCallback((action: TAction, value: boolean) => {
    pendingRef.current = { ...pendingRef.current, [action]: value };
    setPending(pendingRef.current);
  }, []);

  const run = useCallback(
    async <TResult,>(action: TAction, task: () => Promise<TResult>): Promise<TResult | undefined> => {
      if (pendingRef.current[action]) return undefined;

      setActionPending(action, true);
      try {
        return await task();
      } finally {
        setActionPending(action, false);
      }
    },
    [setActionPending]
  );

  const isPending = useCallback((action: TAction) => !!pendingRef.current[action], []);

  const anyPending = useMemo(() => Object.values(pending).some(Boolean), [pending]);

  return { anyPending, isPending, pending, run };
};
