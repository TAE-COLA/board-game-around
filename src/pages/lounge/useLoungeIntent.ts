import { useToast } from '@chakra-ui/react';
import { Paths } from 'app';
import { exitLounge, startDavinciCode, startYachtDice, useAuthContext, useLoungeContext } from 'features';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CommonToast, launch } from 'shared';
import { GameName } from 'shared/string';
import * as Intent from './LoungeIntent';

export function useLoungeIntent() {
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();
  const toast = useToast();

  const auth = useAuthContext();
  const lounge = useLoungeContext();

  const onEvent: Intent.event = {
    onClickExitButton: () => {
      launch(setLoading, async () => {
        await exitLounge(lounge.id, auth.id);
        toast(CommonToast.EXIT_LOUNGE);
        navigate(Paths.main, { replace: true });
      });
    },
    onClickCopyButton: () => {
      navigator.clipboard.writeText(lounge.code);
      toast(CommonToast.COPY_LOUNGE_CODE);
    },
    onClickStartButton: () => {
      launch(setLoading, async () => {
        switch (lounge.game.name) {
          case GameName.YatchDice.korean:
            await startYachtDice(lounge.id);
            break;
          case GameName.DavinciCode.korean:
            await startDavinciCode(lounge.id);
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
          navigate(Paths.yachtDice, { replace: true });
          break;
        case GameName.DavinciCode.korean:
          navigate(Paths.davinciCode, { replace: true });
          break;
      }
    }
  }, [lounge.status]);

  return { loading, onEvent };
}
