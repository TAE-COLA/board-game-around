import { TheMind } from './the-mind.model';
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
} from './the-mind.logic';

const createGame = (playerIds: string[], hands: TheMind['hands']): TheMind =>
  ({
    loungeId: 'lounge-1',
    playerIds,
    level: 1,
    maxLevel: getTheMindMaxLevel(playerIds.length),
    lives: playerIds.length,
    stars: 1,
    hands,
    playedCards: [],
    discardedCards: [],
    readyPlayerIds: [],
    starVotePlayerIds: [],
    lastPlayedAt: null,
    lastResult: null,
    phase: 'PLAYING',
  } as TheMind);

describe('The Mind logic', () => {
  it('allows only 2 to 4 players', () => {
    expect(isValidTheMindPlayerCount(1)).toBe(false);
    expect(isValidTheMindPlayerCount(2)).toBe(true);
    expect(isValidTheMindPlayerCount(3)).toBe(true);
    expect(isValidTheMindPlayerCount(4)).toBe(true);
    expect(isValidTheMindPlayerCount(5)).toBe(false);
  });

  it('normalizes player ids from modern and legacy lounge shapes', () => {
    expect(getTheMindLoungePlayerIds({ playerIds: ['p1', 'p2', 'p3', 'p4'] })).toEqual([
      'p1',
      'p2',
      'p3',
      'p4',
    ]);
    expect(
      getTheMindLoungePlayerIds({
        memberIds: { p1: true, p2: false, p3: true, p4: true },
      })
    ).toEqual(['p1', 'p3', 'p4']);
  });

  it('uses official max levels for 2, 3, and 4 players', () => {
    expect(getTheMindMaxLevel(2)).toBe(12);
    expect(getTheMindMaxLevel(3)).toBe(10);
    expect(getTheMindMaxLevel(4)).toBe(8);
  });

  it('returns level rewards consistently', () => {
    expect(getTheMindLevelReward(2)).toEqual({ stars: 1, lives: 0 });
    expect(getTheMindLevelReward(3)).toEqual({ stars: 0, lives: 1 });
    expect(getTheMindLevelReward(4)).toEqual({ stars: 0, lives: 0 });
  });

  it('deals sorted hands to all 4 players', () => {
    const hands = dealTheMindHands(
      ['p1', 'p2', 'p3', 'p4'],
      2,
      [5, 1, 8, 2, 7, 3, 6, 4]
    );

    expect(hands).toEqual({
      p1: [1, 5],
      p2: [2, 8],
      p3: [3, 7],
      p4: [4, 6],
    });
  });

  it('normalizes only active players hands and sorts cards', () => {
    const game = createGame(['p1', 'p2', 'p3', 'p4'], {
      p1: [43, 10],
      p2: createEmptyTheMindList(),
      p3: [31, 9],
      p4: [25],
      removed: [1],
    });

    expect(normalizeTheMindHands(game)).toEqual({
      p1: [10, 43],
      p2: [],
      p3: [9, 31],
      p4: [25],
    });
  });

  it('finds lower cards in every other 4-player hand sorted by card', () => {
    const lowerCards = getTheMindLowerCardsInOtherHands(
      {
        p1: [43],
        p2: [27, 29],
        p3: [8, 44],
        p4: [30],
      },
      'p1',
      43
    );

    expect(lowerCards).toEqual([
      { playerId: 'p3', card: 8 },
      { playerId: 'p2', card: 27 },
      { playerId: 'p2', card: 29 },
      { playerId: 'p4', card: 30 },
    ]);
    expect(lowerCards[0]).toEqual({ playerId: 'p3', card: 8 });
  });

  it('serializes empty hands with placeholders and treats them as empty', () => {
    const serializedHands = serializeTheMindHands({
      p1: [],
      p2: [],
      p3: [],
      p4: [],
    });

    expect(areTheMindHandsEmpty(serializedHands)).toBe(true);
    expect(normalizeTheMindList(serializedHands.p1)).toEqual([]);
  });

  it('does not complete the level while any 4-player hand still has a card', () => {
    expect(
      areTheMindHandsEmpty({
        p1: createEmptyTheMindList(),
        p2: [],
        p3: [],
        p4: [99],
      })
    ).toBe(false);
  });
});
