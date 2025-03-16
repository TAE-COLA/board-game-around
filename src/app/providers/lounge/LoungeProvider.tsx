import { useToast } from '@chakra-ui/react';
import { Paths } from 'app/route';
import { GameApi, LoungeApi, UserApi } from 'features';
import React, { useEffect, useState } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { CommonToast, createDummy } from 'shared';
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

    LoungeApi.fetchByUserId(auth.id).then((loungeId) => {
      setLoungeState((prevState) => ({ ...prevState, id: loungeId }));
    });
  }, [auth.loading, auth.id]);

  useEffect(() => {
    if (auth.loading || !loungeState.id) return;

    const unsubscribe = LoungeApi.onStateChanged(loungeState.id, async (lounge) => {
      if (lounge) {
        const [game, owner, players] = await Promise.all([
          GameApi.fetchById(lounge.gameId),
          UserApi.fetchById(lounge.ownerId),
          Promise.all(lounge.playerIds.map(UserApi.fetchById)),
        ]);

        setLoungeState({ loading: false, game, owner, players, ...lounge });
      } else {
        navigate(Paths.main, { replace: true });
        toast(CommonToast.NO_LOUNGE);
      }
    });

    return () => unsubscribe();
  }, [auth.loading, loungeState.id]);

  return (
    <LoungeContext.Provider value={loungeState}>
      <Outlet />
    </LoungeContext.Provider>
  );
};
