import * as db from 'firebase/database';
import { FModel } from 'models';
import { LOUNGE, Lounge } from 'features/lounge';
import { CommonError, initialUpdates, isPlaceholder, placeholder, shuffle } from 'shared';
import { getRef } from '../../firebase.util';
import { database } from '../../firebase_config';
import { TheMind, THE_MIND } from '../model';

const reference = db.ref(database);
const serverTimeOffsetReference = db.ref(database, '.info/serverTimeOffset');

const loungeReference = (loungeId: string) =>
  db.child(db.child(reference, LOUNGE.reference), loungeId);
const theMindReference = (loungeId: string) =>
  db.child(db.child(reference, THE_MIND.reference), loungeId);

const getMaxLevel = (playerCount: number) => {
  if (playerCount === 2) return 12;
  if (playerCount === 3) return 10;
  return 8;
};

const getLevelReward = (level: number) => {
  if ([2, 5, 8].includes(level)) return { stars: 1, lives: 0 };
  if ([3, 6, 9].includes(level)) return { stars: 0, lives: 1 };
  return { stars: 0, lives: 0 };
};

const CARD_TIMER_MS = 30_000;
const EMOJIS = ['🙂‍↕️', '🙂‍↔️', '🥱'];

const dealHands = (playerIds: string[], level: number) => {
  const deck = shuffle(Array.from({ length: 100 }, (_, index) => index + 1));

  return playerIds.reduce(
    (acc, playerId, playerIndex) => {
      acc[playerId] = deck
        .slice(playerIndex * level, playerIndex * level + level)
        .sort((a, b) => a - b);
      return acc;
    },
    {} as { [key: string]: number[] }
  );
};

const emptyList = <T>() => [placeholder as unknown as T];

const normalizeList = <T>(value?: T[]) => (value ?? []).filter((item) => !isPlaceholder(item));

const normalizeHands = (game: TheMind): TheMind['hands'] =>
  game.playerIds.reduce((acc, playerId) => {
    acc[playerId] = normalizeList(game.hands?.[playerId]).sort((a, b) => a - b);
    return acc;
  }, {} as TheMind['hands']);

const serializeHands = (hands: TheMind['hands']): TheMind['hands'] =>
  Object.entries(hands).reduce((acc, [playerId, cards]) => {
    acc[playerId] = cards.length === 0 ? emptyList() : cards;
    return acc;
  }, {} as TheMind['hands']);

const areHandsEmpty = (hands: TheMind['hands']) =>
  Object.values(hands).every((cards) => normalizeList(cards).length === 0);

const hasLowerCardInOtherHands = (hands: TheMind['hands'], playerId: string, card: number) =>
  Object.entries(hands).some(
    ([handOwnerId, cards]) => handOwnerId !== playerId && cards.some((handCard) => handCard < card)
  );

const resolveLevelComplete = (game: TheMind): TheMind => {
  const reward = getLevelReward(game.level);
  const lives = Math.min(5, game.lives + reward.lives);
  const stars = Math.min(3, game.stars + reward.stars);
  const isFinalLevel = game.level >= game.maxLevel;

  const nextGame: TheMind = {
    ...game,
    lives,
    stars,
    readyPlayerIds: emptyList(),
    starVotePlayerIds: emptyList(),
    lastPlayedAt: null,
    lastResult: { type: 'SUCCESS', level: game.level, lives },
    phase: isFinalLevel ? 'GAME_WON' : 'LEVEL_COMPLETE',
  };

  if (isFinalLevel) {
    nextGame.finishedAt = db.serverTimestamp() as unknown as Date;
  }

  return nextGame;
};

const startLevel = (game: TheMind, level: number): TheMind => ({
  ...game,
  level,
  hands: dealHands(game.playerIds, level),
  playedCards: emptyList(),
  discardedCards: emptyList(),
  readyPlayerIds: emptyList(),
  starVotePlayerIds: emptyList(),
  lastPlayedAt: null,
  lastResult: null,
  phase: 'READY',
});

const failLevel = (game: TheMind): TheMind => {
  if (game.lives <= 0) {
    return {
      ...game,
      lives: 0,
      phase: 'GAME_LOST',
      lastPlayedAt: null,
      lastResult: { type: 'FAILURE', level: game.level, lives: 0 },
      finishedAt: db.serverTimestamp() as unknown as Date,
    };
  }

  return {
    ...startLevel({ ...game, lives: game.lives - 1 }, game.level),
    lastResult: { type: 'FAILURE', level: game.level, lives: game.lives - 1 },
  };
};

export const start = async (loungeId: string, userId: string): Promise<void> => {
  const loungeSnapshot = await getRef(loungeReference(loungeId), () => {
    throw new Error(CommonError.NO_LOUNGE);
  });
  const lounge = new FModel<Lounge>(loungeSnapshot).sanitize();

  if (lounge.ownerId !== userId) throw new Error(CommonError.PERMISSION_DENIED);
  if (lounge.status !== 'WAITING') throw new Error(CommonError.NO_LOUNGE);
  if (lounge.playerIds.length < 2 || lounge.playerIds.length > 4) {
    throw new Error(CommonError.NO_LOUNGE);
  }

  const statusResult = await db.runTransaction(loungeReference(loungeId), (current) => {
    if (!current || current[LOUNGE.ownerId] !== userId || current[LOUNGE.status] !== 'WAITING') {
      return current;
    }
    return { ...current, [LOUNGE.status]: 'PLAYING' };
  });
  if (!statusResult.committed || statusResult.snapshot.val()?.[LOUNGE.status] !== 'PLAYING') {
    throw new Error(CommonError.PERMISSION_DENIED);
  }

  const playerIds = shuffle(lounge.playerIds);

  const theMind: TheMind = {
    loungeId,
    playerIds,
    level: 1,
    maxLevel: getMaxLevel(playerIds.length),
    lives: playerIds.length,
    stars: 1,
    hands: dealHands(playerIds, 1),
    playedCards: emptyList(),
    discardedCards: emptyList(),
    readyPlayerIds: emptyList(),
    starVotePlayerIds: emptyList(),
    lastPlayedAt: null,
    lastResult: null,
    phase: 'READY',
  };

  const updates = initialUpdates();

  updates[`/${THE_MIND.reference}/${loungeId}`] = theMind;

  await db.update(reference, updates);
};

export const onStateChanged = (
  loungeId: string,
  onChanged: (theMind: TheMind) => void
): db.Unsubscribe => {
  return db.onValue(theMindReference(loungeId), (snapshot) => {
    if (!snapshot.exists()) throw new Error(CommonError.GAME_STATE_FAILED);
    const theMind = new FModel<TheMind>(snapshot).sanitize();

    onChanged(theMind);
  });
};

export const onServerTimeOffsetChanged = (
  onChanged: (serverTimeOffset: number) => void
): db.Unsubscribe => {
  return db.onValue(serverTimeOffsetReference, (snapshot) => {
    onChanged(typeof snapshot.val() === 'number' ? snapshot.val() : 0);
  });
};

export const exit = async (loungeId: string, userId: string): Promise<void> => {
  const theMindSnapshot = await getRef(theMindReference(loungeId), () => {
    throw new Error(CommonError.NO_GAME_LOUNGE);
  });
  const theMind = new FModel<TheMind>(theMindSnapshot).sanitize();

  const filteredPlayerIds = theMind.playerIds.filter((id) => id !== userId);
  const updates = initialUpdates();

  updates[`/${THE_MIND.reference}/${loungeId}/${THE_MIND.hands}/${userId}`] = null;
  updates[`/${THE_MIND.reference}/${loungeId}/${THE_MIND.playerIds}`] = filteredPlayerIds;
  updates[`/${THE_MIND.reference}/${loungeId}/${THE_MIND.readyPlayerIds}`] =
    theMind.readyPlayerIds.filter((id) => id !== userId);
  updates[`/${THE_MIND.reference}/${loungeId}/${THE_MIND.starVotePlayerIds}`] =
    normalizeList(theMind.starVotePlayerIds).filter((id) => id !== userId);

  if (filteredPlayerIds.length === 0) {
    updates[`/${THE_MIND.reference}/${loungeId}/${THE_MIND.finishedAt}`] = db.serverTimestamp();
  }

  await db.update(reference, updates);
};

export const ready = async (loungeId: string, userId: string): Promise<void> => {
  await db.runTransaction(theMindReference(loungeId), (current) => {
    if (!current) return current;
    const game = current as TheMind;
    if (game.phase !== 'READY' || !game.playerIds.includes(userId)) return current;

    const readyPlayerIds = Array.from(new Set([...normalizeList(game.readyPlayerIds), userId]));
    const allReady = game.playerIds.every((playerId) => readyPlayerIds.includes(playerId));

    return {
      ...game,
      readyPlayerIds: allReady ? emptyList() : readyPlayerIds,
      starVotePlayerIds: emptyList(),
      lastPlayedAt: allReady ? null : game.lastPlayedAt ?? null,
      lastResult: allReady ? null : game.lastResult ?? null,
      phase: allReady ? 'PLAYING' : 'READY',
    };
  });
};

export const playCard = async (
  loungeId: string,
  userId: string,
  card: number
): Promise<void> => {
  await db.runTransaction(theMindReference(loungeId), (current) => {
    if (!current) return current;
    const game = current as TheMind;
    if (game.phase !== 'PLAYING' || !game.playerIds.includes(userId)) return current;
    const currentHands = normalizeHands(game);
    const [lowestCard] = currentHands[userId];
    if (lowestCard !== card) return current;

    if (hasLowerCardInOtherHands(currentHands, userId, card)) {
      return failLevel(game);
    }

    const handAfterPlay = currentHands[userId].filter((value) => value !== card);
    const handsAfterPlay = { ...currentHands, [userId]: handAfterPlay };

    let nextGame: TheMind = {
      ...game,
      hands: serializeHands(handsAfterPlay),
      playedCards: [...normalizeList(game.playedCards), card],
      starVotePlayerIds: emptyList(),
      lastPlayedAt: db.serverTimestamp() as unknown as number,
    };

    if (areHandsEmpty(handsAfterPlay)) {
      nextGame = resolveLevelComplete(nextGame);
    }

    return nextGame;
  });
};

export const timeout = async (loungeId: string, serverNow: number): Promise<void> => {
  await db.runTransaction(theMindReference(loungeId), (current) => {
    if (!current) return current;
    const game = current as TheMind;
    if (game.phase !== 'PLAYING' || typeof game.lastPlayedAt !== 'number') return current;
    if (serverNow - game.lastPlayedAt < CARD_TIMER_MS) return current;

    return failLevel(game);
  });
};

export const voteStar = async (loungeId: string, userId: string): Promise<void> => {
  await db.runTransaction(theMindReference(loungeId), (current) => {
    if (!current) return current;
    const game = current as TheMind;
    if (game.phase !== 'PLAYING' || game.stars <= 0 || !game.playerIds.includes(userId)) {
      return current;
    }

    const starVotePlayerIds = Array.from(
      new Set([...normalizeList(game.starVotePlayerIds), userId])
    );
    const allAgreed = game.playerIds.every((playerId) => starVotePlayerIds.includes(playerId));

    if (!allAgreed) {
      return { ...game, starVotePlayerIds };
    }

    const hands = normalizeHands(game);
    const discardedCards: number[] = [];

    game.playerIds.forEach((playerId) => {
      const [lowestCard, ...remainingCards] = hands[playerId].sort((a, b) => a - b);
      if (lowestCard === undefined) return;

      discardedCards.push(lowestCard);
      hands[playerId] = remainingCards;
    });

    let nextGame: TheMind = {
      ...game,
      stars: game.stars - 1,
      hands: serializeHands(hands),
      discardedCards: [
        ...normalizeList(game.discardedCards),
        ...discardedCards,
      ].sort((a, b) => a - b),
      starVotePlayerIds: emptyList(),
    };

    if (areHandsEmpty(hands)) {
      nextGame = resolveLevelComplete(nextGame);
    }

    return nextGame;
  });
};

export const cancelStarVote = async (loungeId: string): Promise<void> => {
  const updates = initialUpdates();

  updates[`/${THE_MIND.reference}/${loungeId}/${THE_MIND.starVotePlayerIds}`] = emptyList();

  await db.update(reference, updates);
};

export const sendEmoji = async (
  loungeId: string,
  userId: string,
  emoji: string
): Promise<void> => {
  if (!EMOJIS.includes(emoji)) return;

  const updates = initialUpdates();

  updates[`/${THE_MIND.reference}/${loungeId}/${THE_MIND.emojis}/${userId}`] = {
    value: emoji,
    shownAt: db.serverTimestamp(),
  };

  await db.update(reference, updates);
};

export const nextLevel = async (loungeId: string): Promise<void> => {
  await db.runTransaction(theMindReference(loungeId), (current) => {
    if (!current) return current;
    const game = current as TheMind;
    if (game.phase !== 'LEVEL_COMPLETE') return current;

    return startLevel(game, game.level + 1);
  });
};

export const restart = async (loungeId: string): Promise<void> => {
  await db.runTransaction(theMindReference(loungeId), (current) => {
    if (!current) return current;
    const game = current as TheMind;
    if (game.phase !== 'GAME_LOST') return current;

    return {
      loungeId: game.loungeId,
      playerIds: game.playerIds,
      level: 1,
      maxLevel: getMaxLevel(game.playerIds.length),
      lives: game.playerIds.length,
      stars: 1,
      hands: dealHands(game.playerIds, 1),
      playedCards: emptyList(),
      discardedCards: emptyList(),
      readyPlayerIds: emptyList(),
      starVotePlayerIds: emptyList(),
      lastPlayedAt: null,
      lastResult: null,
      phase: 'READY',
    };
  });
};
