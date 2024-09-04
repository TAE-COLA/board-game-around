import { Game, User } from 'entities';
import { LoungeContext, exitLounge, fetchGameById, fetchLoungeIdByUserId, fetchUserById, fetchUsersByIds, onLoungeStateChanged, useAuth } from 'features';
import { serverTimestamp } from 'firebase/database';
import React, { useEffect, useState } from 'react';
import { Outlet } from 'react-router-dom';
import { createDummy } from 'shared';

const LoungeProvider: React.FC = () => {
  const [id, setId] = useState('');
  const [loading, setLoading] = useState(true);
  const [game, setGame] = useState(createDummy<Game>());
  const [code, setCode] = useState('');
  const [owner, setOwner] = useState<User>();
  const [members, setMembers] = useState<User[]>([]);
  const [createdAt, setCreatedAt] = useState<object>(serverTimestamp());
  const [deletedAt, setDeletedAt] = useState<object>();

  const { user, loading: authLoading } = useAuth();

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
        if (lounge.ownerId) {
          const owner = await fetchUserById(lounge.ownerId);
          setOwner(owner);
        }
        setCode(lounge.code);
        if (lounge.memberIds) {
          const members = await fetchUsersByIds(lounge.memberIds);
          setMembers(members);
        }
        setCreatedAt(lounge.createdAt);
        setDeletedAt(lounge.deletedAt);
        setLoading(false);
      });

      return () => unsubscribe();
    });
  }, [user, authLoading]);

  const exit = async (userId: string) => {
    setLoading(true);
    await exitLounge(id, userId);
    setLoading(false);
  };

  return (
    <LoungeContext.Provider value={{ id, loading, game, code, owner, members, createdAt, deletedAt, exit }}>
      <Outlet />
    </LoungeContext.Provider>
  );
};

export default LoungeProvider;