import { isPlaceholder, placeholder } from 'shared/placeholder';
import { shuffle } from 'shared/shuffle';
import { TheMind } from './the-mind.model';

export type TheMindStoredLounge = {
  ownerId?: string;
  playerIds?: string[];
  memberIds?: Record<string, boolean>;
  status?: 'WAITING' | 'PLAYING' | 'END';
};

export const createEmptyTheMindList = <T>() => [placeholder as unknown as T];

export const normalizeTheMindList = <T>(value?: T[]) =>
  (value ?? []).filter((item) => !isPlaceholder(item));

export const getTheMindLoungePlayerIds = (lounge: TheMindStoredLounge) => {
  if (Array.isArray(lounge.playerIds)) return lounge.playerIds;
  if (lounge.memberIds) return Object.keys(lounge.memberIds).filter((id) => lounge.memberIds?.[id]);
  return [];
};

export const isValidTheMindPlayerCount = (playerCount: number) =>
  playerCount >= 2 && playerCount <= 4;

export const getTheMindMaxLevel = (playerCount: number) => {
  if (playerCount === 2) return 12;
  if (playerCount === 3) return 10;
  return 8;
};

export const getTheMindLevelReward = (level: number) => {
  if ([2, 5, 8].includes(level)) return { stars: 1, lives: 0 };
  if ([3, 6, 9].includes(level)) return { stars: 0, lives: 1 };
  return { stars: 0, lives: 0 };
};

export const dealTheMindHands = (
  playerIds: string[],
  level: number,
  deck = shuffle(Array.from({ length: 100 }, (_, index) => index + 1))
) =>
  playerIds.reduce(
    (acc, playerId, playerIndex) => {
      acc[playerId] = deck
        .slice(playerIndex * level, playerIndex * level + level)
        .sort((a, b) => a - b);
      return acc;
    },
    {} as TheMind['hands']
  );

export const normalizeTheMindHands = (game: TheMind): TheMind['hands'] =>
  game.playerIds.reduce((acc, playerId) => {
    acc[playerId] = normalizeTheMindList(game.hands?.[playerId]).sort((a, b) => a - b);
    return acc;
  }, {} as TheMind['hands']);

export const serializeTheMindHands = (hands: TheMind['hands']): TheMind['hands'] =>
  Object.entries(hands).reduce((acc, [playerId, cards]) => {
    acc[playerId] = cards.length === 0 ? createEmptyTheMindList() : cards;
    return acc;
  }, {} as TheMind['hands']);

export const areTheMindHandsEmpty = (hands: TheMind['hands']) =>
  Object.values(hands).every((cards) => normalizeTheMindList(cards).length === 0);

export const getTheMindLowerCardsInOtherHands = (
  hands: TheMind['hands'],
  playerId: string,
  card: number
) =>
  Object.entries(hands)
    .flatMap(([handOwnerId, cards]) =>
      handOwnerId === playerId
        ? []
        : cards
            .filter((handCard) => handCard < card)
            .map((handCard) => ({ playerId: handOwnerId, card: handCard }))
    )
    .sort((a, b) => a.card - b.card);
