export class CommonError {
  static readonly SANITIZE_FAILED = (type: string) =>
    `Invalid data: failed to sanitize data. Type is ${type}`;
  static readonly TYPE_NO_ID = 'This type does not have an ID field';

  static readonly PAGE_NOT_INITIALIZED = (page: string) => `${page} Page is not initialized`;

  static readonly NO_AUTH_CONTEXT = 'useAuthContext must be used within an AuthProvider';
  static readonly NO_LOUNGE_CONTEXT = 'useLoungeContext must be used within an LoungeProvider';

  static readonly NO_DATA = 'No data found';
  static readonly NO_GAME = 'No game found';
  static readonly NO_USER = 'No user found';
  static readonly NO_LOUNGE = 'No lounge found';
  static readonly NO_GAME_LOUNGE = 'No game lounge found';
  static readonly NO_USER_LOUNGE = 'No user lounge found';

  static readonly LOUNGE_STATE_FAILED = 'Failed to get lounge state';
  static readonly GAME_STATE_FAILED = 'Failed to get game state';

  static readonly NOT_THIS_GAME = 'Not this game';

  static readonly YACHT_DICE_NO_MORE_ROLLS = 'No more rolls left';

  static readonly PERMISSION_DENIED = 'PERMISSION_DENIED';
}
