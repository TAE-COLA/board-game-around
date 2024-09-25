import { useToast } from '@chakra-ui/react';
import { startYachtDice, useAuthContext, useLoungeContext } from 'features';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { launch } from 'shared';

type LoungeEvent =
  | { type: 'SCREEN_INITIALIZE' }
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
      case 'SCREEN_INITIALIZE':
        setLoading(false);
        break;
      case 'ON_CLICK_EXIT_BUTTON':
        await lounge.exit();
        toast({ title: '게임방을 나왔습니다.', duration: 2000 });
        navigate('/main', { replace: true });
        break;
      case 'ON_CLICK_COPY_BUTTON':
        navigator.clipboard.writeText(lounge.code);
        toast({ title: '게임방 코드가 복사되었습니다.', status: 'success', duration: 2000 });
        break;
      case 'ON_CLICK_START_BUTTON':
        await launch(setLoading, async () => {
          await startYachtDice(lounge.id);
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
    if (lounge.loading) return;

    if (lounge?.status === 'PLAYING') {
      navigate('/' + lounge.game.name, { replace: true });
    }
  }, [lounge.id, lounge.loading]);

  useEffect(() => {
    onEvent({ type: 'SCREEN_INITIALIZE' });
  }, []);

  return {
    loading,
    onEvent
  };
}