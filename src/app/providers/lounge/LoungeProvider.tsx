import { useToast } from '@chakra-ui/react';
import { Paths } from 'app/route';
import {
  fetchGameById,
  fetchLoungeIdByUserId,
  fetchUserById,
  fetchUsersByIds,
  onLoungeStateChanged,
} from 'features';
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

    fetchLoungeIdByUserId(auth.id)
      .then((loungeId) => {
        const unsubscribe = onLoungeStateChanged(loungeId, async (lounge) => {
          if (lounge) {
            const game = await fetchGameById(lounge.gameId);
            const owner = await fetchUserById(lounge.ownerId);
            const players = await fetchUsersByIds(lounge.playerIds);

            setLoungeState({ loading: false, game, owner, players, ...lounge });
          } else {
            navigate(Paths.main, { replace: true });
            toast(CommonToast.NO_LOUNGE);
          }
        });

        return () => unsubscribe();
      })
      .catch(() => {
        navigate(Paths.main, { replace: true });
        toast(CommonToast.NO_LOUNGE);
      });
  }, [auth]);

  return (
    <LoungeContext.Provider value={loungeState}>
      <Outlet />
    </LoungeContext.Provider>
  );
};
