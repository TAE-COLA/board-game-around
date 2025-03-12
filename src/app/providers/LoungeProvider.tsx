import { useToast } from '@chakra-ui/react';
import { Paths } from 'app/route';
import {
  fetchGameById,
  fetchLoungeIdByUserId,
  fetchUserById,
  fetchUsersByIds,
  onLoungeStateChanged,
  useAuthContext,
} from 'features';
import { Game, LoungeContext, User } from 'models';
import React, { useEffect, useState } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { createDummy, noLounge } from 'shared';

type LoungeState = {
  id: string;
  game: Game;
  code: string;
  owner: User;
  players: User[];
  status: 'WAITING' | 'PLAYING' | 'END';
  createdAt: object;
};

export const LoungeProvider: React.FC = () => {
  const auth = useAuthContext();

  const navigate = useNavigate();
  const toast = useToast();

  const [loading, setLoading] = useState(true);
  const [loungeState, setLoungeState] = useState(createDummy<LoungeState>());

  useEffect(() => {
    if (auth.loading) return;

    fetchLoungeIdByUserId(auth.id)
      .then((loungeId) => {
        const unsubscribe = onLoungeStateChanged(loungeId, async (lounge) => {
          if (lounge) {
            const game = await fetchGameById(lounge.gameId);
            const owner = await fetchUserById(lounge.ownerId);
            const players = await fetchUsersByIds(lounge.playerIds);

            setLoungeState({ ...lounge, game, owner, players });
            setLoading(false);
          } else {
            navigate(Paths.main, { replace: true });
            toast(noLounge);
          }
        });

        return () => unsubscribe();
      })
      .catch(() => {
        navigate(Paths.main, { replace: true });
        toast(noLounge);
      });
  }, [auth]);

  return (
    <LoungeContext.Provider value={{ loading, ...loungeState }}>
      <Outlet />
    </LoungeContext.Provider>
  );
};
