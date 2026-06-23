import { useAuthContext, useLoungeContext } from 'app';
import { DavinciCodeApi, LoungeApi, TheMindApi, YachtDiceApi } from 'features';
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
    },
    onClickStartButton: () => {
      launch(setLoading, async () => {
        try {
          if (lounge.game.name === GameName.YatchDice.korean) {
            await YachtDiceApi.start(lounge.id);
          } else if (lounge.game.name === GameName.DavinciCode.korean) {
            await DavinciCodeApi.start(lounge.id);
          } else if (GameName.isTheMind(lounge.game.name)) {
            await TheMindApi.start(lounge.id);
          }
        } catch {
          setSideEffect({ type: 'SHOW_TOAST', options: CommonToast.FIREBASE_PERMISSION_DENIED });
        }
      });
    },
  };

  useEffect(() => {
    setLoading(auth.loading || lounge.loading);
  }, [auth.loading, lounge.loading]);

  useEffect(() => {
    if (lounge?.status === 'PLAYING') {
      if (lounge.game.name === GameName.YatchDice.korean) {
        setSideEffect({ type: 'NAVIGATE_TO_YACHT_DICE' });
      } else if (lounge.game.name === GameName.DavinciCode.korean) {
        setSideEffect({ type: 'NAVIGATE_TO_DAVINCI_CODE' });
      } else if (GameName.isTheMind(lounge.game.name)) {
        setSideEffect({ type: 'NAVIGATE_TO_THE_MIND' });
      }
    }
  }, [lounge.status]);

  return { loading, onEvent, sideEffect };
}
