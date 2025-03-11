import { useToast } from '@chakra-ui/react';
import { Paths } from 'app/route';
import {
  LoungeContext,
  fetchGameById,
  fetchLoungeIdByUserId,
  fetchUserById,
  fetchUsersByIds,
  onLoungeStateChanged,
  useAuthContext,
} from 'features';
import { serverTimestamp } from 'firebase/database';
import { Game, User } from 'models';
import React, { useEffect, useState } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { createDummy, noLounge } from 'shared';

export const LoungeProvider: React.FC = () => {
  const [id, setId] = useState('');
  const [loading, setLoading] = useState(true);
  const [game, setGame] = useState(createDummy<Game>());
  const [code, setCode] = useState('');
  const [owner, setOwner] = useState(createDummy<User>());
  const [players, setplayers] = useState<User[]>([]);
  const [status, setStatus] = useState<'WAITING' | 'PLAYING' | 'END'>('WAITING');
  const [createdAt, setCreatedAt] = useState(serverTimestamp());

  const [isLoungeAvailable, setIsLoungeAvailable] = useState(false);

  const auth = useAuthContext();

  const navigate = useNavigate();
  const toast = useToast();

  useEffect(() => {
    if (auth.loading) return;

    fetchLoungeIdByUserId(auth.id)
      .then((loungeId) => {
        setId(loungeId);
        const unsubscribe = onLoungeStateChanged(loungeId, async (lounge) => {
          if (lounge) {
            setIsLoungeAvailable(true);
            const game = await fetchGameById(lounge.gameId);
            setGame(game);
            const owner = await fetchUserById(lounge.ownerId);
            setOwner(owner);
            const players = await fetchUsersByIds(lounge.playerIds);
            setplayers(players);
            setCode(lounge.code);
            setStatus(lounge.status);
            setCreatedAt(lounge.createdAt);
            setLoading(false);
          } else {
            setIsLoungeAvailable(false);
          }
        });

        return () => unsubscribe();
      })
      .catch(() => {
        navigate(Paths.main, { replace: true });
        toast(noLounge);
      });
  }, [auth]);

  useEffect(() => {
    if (!loading && !isLoungeAvailable) {
      navigate(Paths.main, { replace: true });
      toast(noLounge);
    }
  }, [loading, isLoungeAvailable]);

  return (
    <LoungeContext.Provider value={{ loading, id, game, code, owner, players, status, createdAt }}>
      <Outlet />
    </LoungeContext.Provider>
  );
};
