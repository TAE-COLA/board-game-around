export interface UserLounge {
  loungeId: string;
}

export const USER_LOUNGE = {
  reference: 'User-lounge',
  loungeId: 'loungeId',
} as const;
