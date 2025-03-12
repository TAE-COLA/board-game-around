class ToastOptions {
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
  static readonly REQUIRE_LOGIN = new ToastOptions('로그인이 필요한 메뉴입니다. 로그인해주세요.', 'error', 2000);

  // Lounge
  static readonly NO_LOUNGE = new ToastOptions('게임방이 존재하지 않습니다.', 'error', 2000);
  static readonly EXIT_LOUNGE = new ToastOptions('게임방을 나왔습니다.', undefined, 2000);
}
