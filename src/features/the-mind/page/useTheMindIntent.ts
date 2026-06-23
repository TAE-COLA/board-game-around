import { useAuthContext, useLoungeContext } from 'app';
import { LoungeApi, TheMindApi, UserApi } from 'features';
import { useEffect, useReducer, useState } from 'react';
import { CommonToast, GameName, useAsyncAction, useSideEffectQueue } from 'shared';
import * as Intent from './TheMind.intent';

type TheMindAction =
  | 'exit'
  | 'ready'
  | 'playCard'
  | 'star'
  | 'cancelStar'
  | 'nextLevel'
  | 'restart'
  | 'timeout'
  | 'emoji';

export const useTheMindIntent = () => {
  const auth = useAuthContext();
  const lounge = useLoungeContext();

  const [state, dispatch] = useReducer(Intent.reducer, new Intent.State({}));
  const [loading, setLoading] = useState(true);
  const actions = useAsyncAction<TheMindAction>();
  const {
    clearSideEffects,
    pushSideEffect: setSideEffect,
    sideEffects,
  } = useSideEffectQueue<NonNullable<Intent.SideEffect>>();

  const onEvent: Intent.Event = {
    onClickExitButton: () => {
      actions.run('exit', async () => {
        setLoading(true);
        try {
          await LoungeApi.exit(lounge.id, auth.id);
          await TheMindApi.exit(lounge.id, auth.id);
          setSideEffect({ type: 'SHOW_TOAST', options: CommonToast.EXIT_LOUNGE });
          setSideEffect({ type: 'NAVIGATE_TO_MAIN' });
        } finally {
          setLoading(false);
        }
      });
    },
    onClickReadyButton: () => {
      actions.run('ready', async () => {
        await TheMindApi.ready(lounge.id, auth.id);
      });
    },
    onClickCard: (card) => {
      actions.run('playCard', async () => {
        await TheMindApi.playCard(lounge.id, auth.id, card);
      });
    },
    onClickStarButton: () => {
      actions.run('star', async () => {
        await TheMindApi.voteStar(lounge.id, auth.id);
      });
    },
    onClickCancelStarVoteButton: () => {
      actions.run('cancelStar', async () => {
        await TheMindApi.cancelStarVote(lounge.id);
      });
    },
    onClickNextLevelButton: () => {
      actions.run('nextLevel', async () => {
        await TheMindApi.nextLevel(lounge.id);
      });
    },
    onClickRestartButton: () => {
      actions.run('restart', async () => {
        await TheMindApi.restart(lounge.id);
      });
    },
    onTimerExpired: (serverNow) => {
      actions.run('timeout', async () => {
        await TheMindApi.timeout(lounge.id, serverNow);
      });
    },
    onClickEmoji: (emoji) => {
      actions.run('emoji', async () => {
        await TheMindApi.sendEmoji(lounge.id, auth.id, emoji);
      });
    },
  };

  useEffect(() => {
    if (lounge.loading) return;

    if (!GameName.isTheMind(lounge.game.name)) {
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

  useEffect(() => {
    const unsubscribe = TheMindApi.onServerTimeOffsetChanged((serverTimeOffset) => {
      dispatch({ type: 'UPDATE_SERVER_TIME_OFFSET', serverTimeOffset });
    });

    return () => unsubscribe();
  }, []);

  return { state, loading, clearSideEffects, onEvent, sideEffects };
};
