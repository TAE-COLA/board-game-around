import { useToast } from '@chakra-ui/react';
import { exitLounge, startDavinciCode, startYachtDice, useAuthContext, useLoungeContext } from 'features';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { launch } from 'shared';

type LoungeEvent =
  | { type: 'ON_CLICK_EXIT_BUTTON' }
  | { type: 'ON_CLICK_COPY_BUTTON' }
  | { type: 'ON_CLICK_START_BUTTON' };

export function useLoungeIntent() {
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();
  const toast = useToast();

  const auth = useAuthContext();
  const lounge = useLoungeContext();

  const onEvent = async (event: LoungeEvent) => {
    switch (event.type) {
      case 'ON_CLICK_EXIT_BUTTON':
        await launch(setLoading, async () => {
          await exitLounge(lounge.id, auth.id);
          toast({ title: '게임방을 나왔습니다.', duration: 2000 });
          navigate('/main', { replace: true });
        });
        break;
      case 'ON_CLICK_COPY_BUTTON':
        navigator.clipboard.writeText(lounge.code);
        toast({ title: '게임방 코드가 복사되었습니다.', status: 'success', duration: 2000 });
        break;
      case 'ON_CLICK_START_BUTTON':
        await launch(setLoading, async () => {
          switch (lounge.game.name) {
            case '요트다이스':
              await startYachtDice(lounge.id);
              break;
            case '다빈치코드':
              await startDavinciCode(lounge.id);
              break;
            default:
              break;
          }
        })
        break;
      default:
        break;
    }
  };

  useEffect(() => {
    setLoading(auth.loading || lounge.loading);
  }, [auth.loading, lounge.loading]);

  useEffect(() => {
    if (lounge?.status === 'PLAYING') {
      switch (lounge.game.name) {
        case '요트다이스':
          navigate('/yatchdice', { replace: true });
          break;
        case '다빈치코드':
          navigate('/davincicode', { replace: true });
          break;
        default:
          break;
      }
    }
  }, [lounge.status]);

  return {
    loading,
    onEvent
  };
}