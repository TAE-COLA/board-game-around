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

// Auth
export const requireLogin = new ToastOptions('로그인이 필요한 메뉴입니다. 로그인해주세요.', 'error', 2000);

// Lounge
export const noLounge = new ToastOptions('게임방이 존재하지 않습니다.', 'error', 2000);
