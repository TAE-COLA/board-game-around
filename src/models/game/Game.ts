export interface Game {
  id: string;
  name: string;
  description: string;
  image: string;
}

export const GAME = {
  collection: 'Games',
  name: 'name',
  description: 'description',
  image: 'image',
} as const;
