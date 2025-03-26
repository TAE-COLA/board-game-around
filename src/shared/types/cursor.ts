export enum Cursor {
  Default = 'default', // 기본 커서
  Pointer = 'pointer', // 클릭 가능한 요소 (ex. 버튼, 링크)
  Text = 'text', // 텍스트 선택 (ex. 입력창)
  Move = 'move', // 이동 가능
  Grab = 'grab', // 드래그 가능 (비활성)
  Grabbing = 'grabbing', // 드래그 중 (활성)
  NotAllowed = 'not-allowed', // 클릭 불가
  Wait = 'wait', // 대기 중 표시
  Progress = 'progress', // 진행 중 표시 (ex. 로딩)
  Crosshair = 'crosshair', // 십자선 커서
  ZoomIn = 'zoom-in', // 확대
  ZoomOut = 'zoom-out', // 축소
  Help = 'help', // 도움말 커서
  None = 'none', // 커서 숨김
}
