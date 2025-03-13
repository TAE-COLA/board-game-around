export class CommonError {
  static readonly SANITIZE_FAILED = (type: string) => `Invalid data: failed to sanitize data. Type is ${type}`;

  static readonly NO_AUTH_CONTEXT = 'useAuthContext must be used within an AuthProvider';
  static readonly NO_LOUNGE_CONTEXT = 'useLoungeContext must be used within an LoungeProvider';

  static readonly NO_GAME = 'No game found';
  static readonly NO_USER = 'No user found';
  static readonly NO_LOUNGE = 'No lounge found';

  static readonly GAME_STATE_FAILED = 'Failed to get game state';

  static readonly PERMISSION_DENIED = 'PERMISSION_DENIED';
}
