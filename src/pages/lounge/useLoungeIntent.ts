import { useAuthContext, useLoungeContext } from 'app';
import { DavinciCodeApi, LoungeApi, YachtDiceApi } from 'features';
import { useEffect, useState } from 'react';
import { CommonToast, GameName, launch } from 'shared';
import * as Intent from './Lounge.intent';

export function useLoungeIntent() {
  const auth = useAuthContext();
  const lounge = useLoungeContext();

  const [loading, setLoading] = useState(true);

  const [sideEffect, setSideEffect] = useState<Intent.SideEffect>();

  const onEvent: Intent.Event = {
    onClickExitButton: () => {
      launch(setLoading, async () => {
        await LoungeApi.exit(lounge.id, auth.id);
        setSideEffect({ type: 'SHOW_TOAST', options: CommonToast.EXIT_LOUNGE });
        setSideEffect({ type: 'POP_BACK_STACK' });
      });
    },
    onClickCopyButton: () => {
      setSideEffect({ type: 'COPY_CLIPBOARD', value: lounge.code });
      setSideEffect({ type: 'SHOW_TOAST', options: CommonToast.COPY_LOUNGE_CODE });
    },
    onClickStartButton: () => {
      launch(setLoading, async () => {
        switch (lounge.game.name) {
          case GameName.YatchDice.korean:
            await YachtDiceApi.start(lounge.id);
            break;
          case GameName.DavinciCode.korean:
            await DavinciCodeApi.start(lounge.id);
            break;
        }
      });
    },
  };

  useEffect(() => {
    setLoading(auth.loading || lounge.loading);
  }, [auth.loading, lounge.loading]);

  useEffect(() => {
    if (lounge?.status === 'PLAYING') {
      switch (lounge.game.name) {
        case GameName.YatchDice.korean:
          setSideEffect({ type: 'NAVIGATE_TO_YACHT_DICE' });
          break;
        case GameName.DavinciCode.korean:
          setSideEffect({ type: 'NAVIGATE_TO_DAVINCI_CODE' });
          break;
      }
    }
  }, [lounge.status]);

  return { loading, onEvent, sideEffect };
}
