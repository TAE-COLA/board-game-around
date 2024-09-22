import { useToast } from '@chakra-ui/react';
import { Game, User } from 'entities';
import { LoungeContext, exitLounge, fetchGameById, fetchLoungeIdByUserId, fetchUserById, fetchUsersByIds, onLoungeStateChanged, useAuth } from 'features';
import { serverTimestamp } from 'firebase/database';
import React, { useEffect, useState } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { createDummy } from 'shared';

const LoungeProvider: React.FC = () => {
  const [id, setId] = useState('');
  const [loading, setLoading] = useState(true);
  const [game, setGame] = useState(createDummy<Game>());
  const [code, setCode] = useState('');
  const [owner, setOwner] = useState<User>(createDummy<User>());
  const [players, setplayers] = useState<User[]>([]);
  const [status, setStatus] = useState<'WAITING' | 'PLAYING' | 'END'>('WAITING');
  const [createdAt, setCreatedAt] = useState<object>(serverTimestamp());

  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();

  useEffect(() => {
    if (authLoading) {
      return;
    }
    
    if (!user) {
      setLoading(false);
      return;
    }

    fetchLoungeIdByUserId(user.id).then((loungeId) => {
      if (!loungeId) {
        setLoading(false);
        return;
      }

      setId(loungeId)
      const unsubscribe = onLoungeStateChanged(loungeId, async (lounge) => {
        const game = await fetchGameById(lounge.gameId);
        setGame(game);
        if (lounge.ownerId && lounge.playerIds && !lounge.deletedAt) {
          const owner = await fetchUserById(lounge.ownerId);
          setOwner(owner);
          const players = await fetchUsersByIds(lounge.playerIds);
          setplayers(players);
        } else {
          toast({ title: '게임방이 존재하지 않습니다.', status: 'error', duration: 2000 });
          navigate('/main', { replace: true });
        }
        setCode(lounge.code);
        setStatus(lounge.status);
        if (lounge.status === 'PLAYING') {
          navigate('/' + game.name, { replace: true });
        }
        setCreatedAt(lounge.createdAt);
        setLoading(false);
      });

      return () => unsubscribe();
    });
  }, [user, authLoading]);

  const exit = async () => {
    setLoading(true);
    if (user) {
      await exitLounge(id, user.id);
    }
    setLoading(false);
  };

  return (
    <LoungeContext.Provider value={{ id, loading, game, code, owner, players, status, createdAt, exit }}>
      <Outlet />
    </LoungeContext.Provider>
  );
};

export default LoungeProvider;