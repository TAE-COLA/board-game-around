export class ToastOptions {
  title: string;
  status: 'error' | 'loading' | 'info' | 'warning' | 'success' | undefined;
  duration: number;

  constructor(
    title: string,
    status: 'error' | 'loading' | 'info' | 'warning' | 'success' | undefined,
    duration: number
  ) {
    this.title = title;
    this.status = status;
    this.duration = duration;
  }
}

export class CommonToast {
  // Auth
  static readonly REQUIRE_LOGIN = new ToastOptions(
    '로그인이 필요한 메뉴입니다. 로그인해주세요.',
    'error',
    2000
  );
  static readonly ALREADY_LOGIN = new ToastOptions('이미 로그인되어 있습니다.', undefined, 2000);
  static readonly LOGIN_SUCCESS = new ToastOptions('로그인이 완료되었습니다.', 'success', 2000);
  static readonly LOGIN_FAILED = new ToastOptions('로그인에 실패했습니다.', 'error', 2000);
  static readonly LOGOUT_SUCCESS = new ToastOptions('로그아웃되었습니다.', 'success', 2000);
  static readonly REGIST_SUCCESS = new ToastOptions('회원가입이 완료되었습니다.', 'success', 2000);

  // Lounge
  static readonly NO_LOUNGE = new ToastOptions('게임방이 존재하지 않습니다.', 'error', 2000);
  static readonly EXIT_LOUNGE = new ToastOptions('게임방을 나왔습니다.', undefined, 2000);
  static readonly COPY_LOUNGE_CODE = new ToastOptions(
    '게임방 코드가 복사되었습니다.',
    'success',
    2000
  );
  static readonly INVALID_GAME_ID = new ToastOptions(
    '유효하지 않은 코드거나 게임이 다릅니다.',
    'error',
    2000
  );

  // Game
  static readonly MY_TURN = new ToastOptions('내 차례입니다.', 'info', 2000);
  static readonly NOT_MY_TURN = new ToastOptions('내 차례가 아닙니다.', 'error', 2000);
}
