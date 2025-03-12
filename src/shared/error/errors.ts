export const errorSanitizeFailed = (type: string) => `Invalid data: failed to sanitize data. Type is ${type}`;

export const errorNoAuthContext = 'useAuthContext must be used within an AuthProvider';
export const errorNoLoungeContext = 'useLoungeContext must be used within an LoungeProvider';

export const errorNoGame = '게임의 정보가 없습니다.';
export const errorNoUser = 'No user found';
export const errorNoLounge = 'No lounge found';

export const errorGameStateFailed = '게임의 상태를 받아오는 데 실패했습니다. 다시 시도해주세요.';
