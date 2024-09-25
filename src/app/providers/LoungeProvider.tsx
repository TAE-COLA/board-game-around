import { useToast } from '@chakra-ui/react';
import { Game, User } from 'entities';
import { LoungeContext, exitLounge, fetchGameById, fetchLoungeIdByUserId, fetchUserById, fetchUsersByIds, onLoungeStateChanged, useAuthContext } from 'features';
import { serverTimestamp } from 'firebase/database';
import React, { useEffect, useState } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { createDummy, launch } from 'shared';

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
          if (lounge.status === 'PLAYING') {
            navigate('/' + game.name, { replace: true });
          }
          setCreatedAt(lounge.createdAt);
          setLoading(false);
        } else {
          setIsLoungeAvailable(false);
        }
      });

      return () => unsubscribe();
    });
  }, [auth]);

  const exit = async () => {
    await launch(setLoading, async () => {
      await exitLounge(id, auth.id);
      toast({ title: '게임방을 나왔습니다.', duration: 2000 });
      navigate('/main', { replace: true });
    });
  };

  useEffect(() => {
    if (!loading && !isLoungeAvailable) {
      navigate('/main', { replace: true });
        toast({ title: '게임방이 존재하지 않습니다.', status: 'error', duration: 2000 });
    }
  }, [loading, isLoungeAvailable]);

  return (
    <LoungeContext.Provider value={{ loading, id, game, code, owner, players, status, createdAt, exit }}>
      <Outlet />
    </LoungeContext.Provider>
  );
};

export default LoungeProvider;