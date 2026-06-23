export interface Game {
  id: string;
  name: string;
  description: string;
  image: string;
  metadata?: GameMetadata;
}

export interface GameMetadata {
  minPlayers: number;
  maxPlayers: number;
  playMode: '협동게임' | '경쟁게임';
  gameType: '심리게임' | '운빨게임';
  averagePlayTimeMinutes: number;
}

export const GAME = {
  collection: 'Games',
  name: 'name',
  description: 'description',
  image: 'image',
  metadata: 'metadata',
} as const;
