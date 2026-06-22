import { useAuthContext, useLoungeContext } from 'app';
import { LoungeApi, TheMindApi, UserApi } from 'features';
import { useEffect, useReducer, useState } from 'react';
import { CommonToast, GameName, launch } from 'shared';
import * as Intent from './TheMind.intent';

export const useTheMindIntent = () => {
  const auth = useAuthContext();
  const lounge = useLoungeContext();

  const [state, dispatch] = useReducer(Intent.reducer, new Intent.State({}));
  const [loading, setLoading] = useState(true);
  const [sideEffect, setSideEffect] = useState<Intent.SideEffect>();

  const onEvent: Intent.Event = {
    onClickExitButton: () => {
      launch(setLoading, async () => {
        await LoungeApi.exit(lounge.id, auth.id);
        await TheMindApi.exit(lounge.id, auth.id);
        setSideEffect({ type: 'SHOW_TOAST', options: CommonToast.EXIT_LOUNGE });
        setSideEffect({ type: 'NAVIGATE_TO_MAIN' });
      });
    },
  };

  useEffect(() => {
    if (lounge.loading) return;

    if (lounge.game.name !== GameName.TheMind.korean) {
      setSideEffect({ type: 'SHOW_TOAST', options: CommonToast.NO_LOUNGE });
      setSideEffect({ type: 'NAVIGATE_TO_MAIN' });
      return;
    }

    const unsubscribe = TheMindApi.onStateChanged(lounge.id, async (game) => {
      const players = await Promise.all(game.playerIds.map(UserApi.fetchById));

      dispatch({ type: 'UPDATE_PLAYERS', players });
      dispatch({ type: 'UPDATE_GAME', game });
      setLoading(false);
    });

    return () => unsubscribe();
  }, [lounge.id, lounge.loading]);

  return { state, loading, onEvent, sideEffect };
};
