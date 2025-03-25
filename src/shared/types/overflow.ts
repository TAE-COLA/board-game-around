export enum Overflow {
  Auto = 'auto', // 콘텐츠 넘치면 스크롤 생김
  Hidden = 'hidden', // 넘치는 콘텐츠 잘림
  Visible = 'visible', // 넘치는 콘텐츠 보임
  Scroll = 'scroll', // 무조건 스크롤
  Clip = 'clip', // 잘리지만 스크롤 없음 (CSS 4+)
}
