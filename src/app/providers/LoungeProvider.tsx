import { useToast } from '@chakra-ui/react';
import { Game, User } from 'entities';
import { LoungeContext, fetchGameById, fetchLoungeIdByUserId, fetchUserById, fetchUsersByIds, onLoungeStateChanged, useAuthContext } from 'features';
import { serverTimestamp } from 'firebase/database';
import React, { useEffect, useState } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { createDummy } from 'shared';

const LoungeProvider: React.FC = () => {
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

    fetchLoungeIdByUserId(auth.id).then((loungeId) => {
      if (!loungeId) {
        navigate('/main', { replace: true });
        toast({ title: '게임방이 존재하지 않습니다.', status: 'error', duration: 2000 });
        return;
      }

      setId(loungeId)
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
    });
  }, [auth]);

  useEffect(() => {
    if (!loading && !isLoungeAvailable) {
      navigate('/main', { replace: true });
        toast({ title: '게임방이 존재하지 않습니다.', status: 'error', duration: 2000 });
    }
  }, [loading, isLoungeAvailable]);

  return (
    <LoungeContext.Provider value={{ loading, id, game, code, owner, players, status, createdAt }}>
      <Outlet />
    </LoungeContext.Provider>
  );
};

export default LoungeProvider;