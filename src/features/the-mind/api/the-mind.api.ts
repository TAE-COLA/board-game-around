import * as db from 'firebase/database';
import { FModel } from 'models';
import { LOUNGE } from 'features/lounge';
import { CommonError, initialUpdates } from 'shared';
import { shuffle } from 'shared/shuffle';
import { getRef } from '../../firebase.util';
import { database } from '../../firebase_config';
import {
  areTheMindHandsEmpty,
  createEmptyTheMindList,
  dealTheMindHands,
  getTheMindLevelReward,
  getTheMindLoungePlayerIds,
  getTheMindLowerCardsInOtherHands,
  getTheMindMaxLevel,
  isValidTheMindPlayerCount,
  normalizeTheMindHands,
  normalizeTheMindList,
  serializeTheMindHands,
  TheMind,
  THE_MIND,
  TheMindFailureDetail,
  TheMindStoredLounge,
} from '../model';

const reference = db.ref(database);
const serverTimeOffsetReference = db.ref(database, '.info/serverTimeOffset');

const loungeReference = (loungeId: string) =>
  db.child(db.child(reference, LOUNGE.reference), loungeId);
const theMindReference = (loungeId: string) =>
  db.child(db.child(reference, THE_MIND.reference), loungeId);

const CARD_TIMER_MS = 30_000;
const EMOJIS = ['🙂‍↕️', '🙂‍↔️', '🥱'];

const resolveLevelComplete = (game: TheMind): TheMind => {
  const reward = getTheMindLevelReward(game.level);
  const lives = Math.min(5, game.lives + reward.lives);
  const stars = Math.min(3, game.stars + reward.stars);
  const isFinalLevel = game.level >= game.maxLevel;

  const nextGame: TheMind = {
    ...game,
    lives,
    stars,
    readyPlayerIds: createEmptyTheMindList(),
    starVotePlayerIds: createEmptyTheMindList(),
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
  hands: dealTheMindHands(game.playerIds, level),
  playedCards: createEmptyTheMindList(),
  discardedCards: createEmptyTheMindList(),
  discardedCardsByPlayerId: {},
  readyPlayerIds: createEmptyTheMindList(),
  starVotePlayerIds: createEmptyTheMindList(),
  lastPlayedAt: null,
  lastResult: null,
  phase: 'READY',
});

const failLevel = (game: TheMind, failure?: TheMindFailureDetail): TheMind => {
  const lastResult = {
    type: 'FAILURE' as const,
    level: game.level,
    lives: Math.max(0, game.lives - 1),
    ...(failure ? { failure } : {}),
  };

  if (game.lives <= 0) {
    return {
      ...game,
      lives: 0,
      phase: 'GAME_LOST',
      lastPlayedAt: null,
      lastResult: { ...lastResult, lives: 0 },
      finishedAt: db.serverTimestamp() as unknown as Date,
    };
  }

  return {
    ...startLevel({ ...game, lives: game.lives - 1 }, game.level),
    lastResult,
  };
};

export const start = async (loungeId: string, userId: string): Promise<void> => {
  const loungeSnapshot = await getRef(loungeReference(loungeId), () => {
    throw new Error(CommonError.NO_LOUNGE);
  });
  const lounge = new FModel<TheMindStoredLounge>(loungeSnapshot).sanitize();
  const loungePlayerIds = getTheMindLoungePlayerIds(lounge);

  if (lounge.ownerId !== userId) throw new Error(CommonError.PERMISSION_DENIED);
  if (lounge.status !== 'WAITING') throw new Error(CommonError.NO_LOUNGE);
  if (!isValidTheMindPlayerCount(loungePlayerIds.length)) {
    throw new Error(CommonError.NO_LOUNGE);
  }

  const statusResult = await db.runTransaction(loungeReference(loungeId), (current) => {
    if (!current) return;

    const currentLounge = current as TheMindStoredLounge;
    const currentPlayerIds = getTheMindLoungePlayerIds(currentLounge);

    if (
      currentLounge[LOUNGE.ownerId] !== userId ||
      currentLounge[LOUNGE.status] !== 'WAITING' ||
      !isValidTheMindPlayerCount(currentPlayerIds.length)
    ) {
      return;
    }

    return { ...current, [LOUNGE.playerIds]: currentPlayerIds, [LOUNGE.status]: 'PLAYING' };
  });
  const startedLounge = statusResult.snapshot.val() as TheMindStoredLounge | null;
  const startedPlayerIds = getTheMindLoungePlayerIds(startedLounge ?? {});

  if (
    !statusResult.committed ||
    startedLounge?.[LOUNGE.status] !== 'PLAYING' ||
    !isValidTheMindPlayerCount(startedPlayerIds.length)
  ) {
    throw new Error(CommonError.PERMISSION_DENIED);
  }

  const playerIds = shuffle(startedPlayerIds);

  const theMind: TheMind = {
    loungeId,
    playerIds,
    level: 1,
    maxLevel: getTheMindMaxLevel(playerIds.length),
    lives: playerIds.length,
    stars: 1,
    hands: dealTheMindHands(playerIds, 1),
    playedCards: createEmptyTheMindList(),
    discardedCards: createEmptyTheMindList(),
    discardedCardsByPlayerId: {},
    readyPlayerIds: createEmptyTheMindList(),
    starVotePlayerIds: createEmptyTheMindList(),
    lastPlayedAt: null,
    lastResult: null,
    speechBubbles: {},
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
    normalizeTheMindList(theMind.starVotePlayerIds).filter((id) => id !== userId);

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

    const readyPlayerIds = Array.from(new Set([...normalizeTheMindList(game.readyPlayerIds), userId]));
    const allReady = game.playerIds.every((playerId) => readyPlayerIds.includes(playerId));

    return {
      ...game,
      readyPlayerIds: allReady ? createEmptyTheMindList() : readyPlayerIds,
      starVotePlayerIds: createEmptyTheMindList(),
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
    const currentHands = normalizeTheMindHands(game);
    const [lowestCard] = currentHands[userId];
    if (lowestCard !== card) return current;

    const blockingCards = getTheMindLowerCardsInOtherHands(currentHands, userId, card);
    if (blockingCards.length > 0) {
      const [lowestBlockingCard] = blockingCards;
      const gameWithSpeechBubble = {
        ...game,
        speechBubbles: {
          ...(game.speechBubbles ?? {}),
          [userId]: {
            type: 'CARD' as const,
            value: `${card}`,
            shownAt: db.serverTimestamp() as unknown as number,
          },
        },
      };

      return failLevel(gameWithSpeechBubble, {
        reason: 'LOWER_CARD',
        playedByPlayerId: userId,
        playedCard: card,
        blockingCards: [lowestBlockingCard],
        playedCards: [...normalizeTheMindList(game.playedCards), card],
      });
    }

    const handAfterPlay = currentHands[userId].filter((value) => value !== card);
    const handsAfterPlay = { ...currentHands, [userId]: handAfterPlay };

    let nextGame: TheMind = {
      ...game,
      hands: serializeTheMindHands(handsAfterPlay),
      playedCards: [...normalizeTheMindList(game.playedCards), card],
      starVotePlayerIds: createEmptyTheMindList(),
      speechBubbles: {
        ...(game.speechBubbles ?? {}),
        [userId]: {
          type: 'CARD',
          value: `${card}`,
          shownAt: db.serverTimestamp() as unknown as number,
        },
      },
      lastPlayedAt: db.serverTimestamp() as unknown as number,
    };

    if (areTheMindHandsEmpty(handsAfterPlay)) {
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

    return failLevel(game, {
      reason: 'TIMEOUT',
      playedCards: normalizeTheMindList(game.playedCards),
    });
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
      new Set([...normalizeTheMindList(game.starVotePlayerIds), userId])
    );
    const allAgreed = game.playerIds.every((playerId) => starVotePlayerIds.includes(playerId));

    if (!allAgreed) {
      return { ...game, starVotePlayerIds };
    }

    const hands = normalizeTheMindHands(game);
    const discardedCards: number[] = [];
    const discardedCardsByPlayerId = { ...(game.discardedCardsByPlayerId ?? {}) };

    game.playerIds.forEach((playerId) => {
      const [lowestCard, ...remainingCards] = hands[playerId].sort((a, b) => a - b);
      if (lowestCard === undefined) return;

      discardedCards.push(lowestCard);
      discardedCardsByPlayerId[playerId] = [
        ...normalizeTheMindList(discardedCardsByPlayerId[playerId]),
        lowestCard,
      ];
      hands[playerId] = remainingCards;
    });

    let nextGame: TheMind = {
      ...game,
      stars: game.stars - 1,
      hands: serializeTheMindHands(hands),
      discardedCards: [
        ...normalizeTheMindList(game.discardedCards),
        ...discardedCards,
      ].sort((a, b) => a - b),
      discardedCardsByPlayerId,
      starVotePlayerIds: createEmptyTheMindList(),
    };

    if (areTheMindHandsEmpty(hands)) {
      nextGame = resolveLevelComplete(nextGame);
    }

    return nextGame;
  });
};

export const cancelStarVote = async (loungeId: string, userId: string): Promise<void> => {
  await db.runTransaction(theMindReference(loungeId), (current) => {
    if (!current) return current;
    const game = current as TheMind;
    if (game.phase !== 'PLAYING' || !game.playerIds.includes(userId)) return current;

    const starVotePlayerIds = normalizeTheMindList(game.starVotePlayerIds).filter(
      (playerId) => playerId !== userId
    );

    return {
      ...game,
      starVotePlayerIds:
        starVotePlayerIds.length === 0 ? createEmptyTheMindList() : starVotePlayerIds,
    };
  });
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
  updates[`/${THE_MIND.reference}/${loungeId}/${THE_MIND.speechBubbles}/${userId}`] = {
    type: 'EMOJI',
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
      maxLevel: getTheMindMaxLevel(game.playerIds.length),
      lives: game.playerIds.length,
      stars: 1,
      hands: dealTheMindHands(game.playerIds, 1),
      playedCards: createEmptyTheMindList(),
      discardedCards: createEmptyTheMindList(),
      discardedCardsByPlayerId: {},
      readyPlayerIds: createEmptyTheMindList(),
      starVotePlayerIds: createEmptyTheMindList(),
      lastPlayedAt: null,
      lastResult: null,
      speechBubbles: {},
      phase: 'READY',
    };
  });
};
