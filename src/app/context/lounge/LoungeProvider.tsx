import { useToast } from '@chakra-ui/react';
import { GameApi, LoungeApi, UserApi } from 'features';
import React, { useEffect, useState } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { CommonToast, createDummy } from 'shared';
import { Paths } from '../../route';
import { useAuthContext } from '../auth';
import { LoungeContext, LoungeContextType } from './LoungeContext';

export const LoungeProvider: React.FC = () => {
  const auth = useAuthContext();

  const navigate = useNavigate();
  const toast = useToast();

  const [loungeState, setLoungeState] = useState({
    ...createDummy<LoungeContextType>(),
    loading: true,
  });

  useEffect(() => {
    if (auth.loading) return;

    let cancelled = false;

    setLoungeState((prevState) => ({ ...prevState, loading: true }));

    LoungeApi.fetchByUserId(auth.id)
      .then((loungeId) => {
        if (cancelled) return;
        setLoungeState((prevState) => ({ ...prevState, id: loungeId }));
      })
      .catch(() => {
        if (cancelled) return;
        setLoungeState({ ...createDummy<LoungeContextType>(), loading: false });
        navigate(Paths.main, { replace: true });
        toast(CommonToast.NO_LOUNGE);
      });

    return () => {
      cancelled = true;
    };
  }, [auth.loading, auth.id, navigate, toast]);

  useEffect(() => {
    if (auth.loading || !loungeState.id) return;

    let cancelled = false;

    const unsubscribe = LoungeApi.onStateChanged(loungeState.id, async (lounge) => {
      if (lounge) {
        try {
          const [game, owner, players] = await Promise.all([
            GameApi.fetchById(lounge.gameId),
            UserApi.fetchById(lounge.ownerId),
            Promise.all(lounge.playerIds.map(UserApi.fetchById)),
          ]);

          if (cancelled) return;

          setLoungeState({ loading: false, game, owner, players, ...lounge });
        } catch {
          if (cancelled) return;
          setLoungeState({ ...createDummy<LoungeContextType>(), loading: false });
          navigate(Paths.main, { replace: true });
          toast(CommonToast.NO_LOUNGE);
        }
      } else {
        if (cancelled) return;
        navigate(Paths.main, { replace: true });
        toast(CommonToast.NO_LOUNGE);
      }
    });

    return () => {
      cancelled = true;
      unsubscribe();
    };
  }, [auth.loading, loungeState.id, navigate, toast]);

  return (
    <LoungeContext.Provider value={loungeState}>
      <Outlet />
    </LoungeContext.Provider>
  );
};
