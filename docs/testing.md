# 테스트 작성 기준

이 문서는 개발 직후 Codex와 개발자가 같은 방식으로 빠르게 검증할 수 있도록 테스트 작성 기준을 정리합니다.

## 기본 원칙

- 순수 로직은 Firebase, React, Chakra UI와 분리해서 단위 테스트합니다.
- API 함수가 커지면 규칙 계산은 `model/*.logic.ts`로 빼고, API는 저장소 읽기/쓰기와 트랜잭션 조율에 집중합니다.
- 테스트에서는 barrel import를 피합니다. 예를 들어 `shared` 대신 `shared/shuffle`, `shared/placeholder`처럼 개별 파일을 직접 import합니다.
- 테스트는 버그를 재현하는 구체적인 상태를 이름과 fixture로 드러냅니다.
- 랜덤 로직은 `Math.random` mock이나 고정 deck 인자를 사용해서 결정적으로 검증합니다.
- Firebase transaction, 로그인, 라우팅, 여러 브라우저 세션이 필요한 흐름은 단위 테스트가 아니라 통합/UI 테스트 대상으로 분리합니다.

## 테스트 위치

```text
src/shared/shared.logic.test.ts
  shared의 순수 유틸 테스트

src/features/<feature>/model/*.logic.ts
  기능별 순수 규칙

src/features/<feature>/model/*.logic.test.ts
  기능별 순수 규칙 테스트
```

## 명령

```bash
npm run test:shared
npm run test:the-mind
npm run test:logic
npm run build
```

- `test:shared`: 공통 순수 로직만 빠르게 확인합니다.
- `test:the-mind`: 더 마인드 규칙만 빠르게 확인합니다.
- `test:logic`: 현재 빠른 로직 테스트 묶음입니다. 개발 직후 우선 실행합니다.
- `build`: TypeScript/React 전체 컴파일 검증입니다.

테스트 스크립트에는 `--runInBand`를 사용합니다. Codex와 Windows 로컬 환경에서 Jest worker spawn 이슈를 줄이기 위한 선택입니다.

## 단위 테스트 작성 기준

단위 테스트에 넣을 것:

- 입력과 출력이 명확한 순수 함수
- 인원 수, 레벨, 보상, 카드 정렬, placeholder 정규화 같은 규칙
- 이전 버그를 막는 경계 케이스
- 2인/3인/4인처럼 게임 규칙상 의미 있는 파라미터 조합

단위 테스트에 넣지 말 것:

- Firebase `runTransaction` 자체 동작
- Chakra/React 렌더링 세부사항
- 브라우저 클릭 흐름
- 실제 인증 계정이 필요한 흐름

## 통합 테스트 후보

Firebase Emulator 기반 통합 테스트를 추가할 때 우선순위는 다음과 같습니다.

- 2/3/4명 더 마인드 시작 성공
- 1명/5명 더 마인드 시작 실패
- 시작 직전 인원 변경 시 game `playerIds`와 lounge `playerIds` 일치
- 4명 모두 ready 해야 `PLAYING` 전환
- 4명 모두 star vote 해야 스타 사용
- 실패 시 가장 낮은 미제출 카드 1개만 failure detail에 저장

## UI 테스트 후보

Playwright UI 테스트는 핵심 smoke test 위주로 둡니다.

- 더 마인드 페이지가 렌더링되는지
- 실패 모달 문구가 표시되는지
- 실패를 유발한 마지막 played card가 빨간색으로 표시되는지
- 4명 플레이어 카드/준비/스타 상태가 화면에서 깨지지 않는지

UI 테스트는 비용이 크므로 모든 규칙을 UI로 재검증하지 않습니다. 규칙은 단위 테스트에서 검증하고, UI는 연결이 끊기지 않았는지만 봅니다.

## 새 테스트를 추가할 때 체크리스트

- 테스트 이름이 규칙을 설명하는가?
- 랜덤/시간/서버 상태가 결정적으로 고정되어 있는가?
- 실패했을 때 로그만 보고 어떤 규칙이 깨졌는지 알 수 있는가?
- UI 의존성이 필요 없는 테스트가 React/Chakra를 import하지 않는가?
- `npm run test:logic` 또는 관련 feature test가 통과하는가?
- 변경이 TypeScript 컴파일에 안전한지 `npm run build`로 확인했는가?
