# Board Game Around

Board Game Around는 여러 명이 온라인으로 보드게임을 즐길 수 있는 React 기반 웹 애플리케이션입니다. Firebase Authentication, Firestore, Realtime Database를 사용해 사용자 인증, 게임 목록, 라운지, 게임 진행 상태를 동기화합니다.

## 주요 기능

- 이메일 기반 회원가입 및 로그인
- 게임 목록 조회
- 게임별 라운지 생성
- 초대 코드로 라운지 참가
- 라운지 참가자 목록 및 게임 시작
- Firebase 기반 실시간 게임 상태 동기화
- 게임 중 라운지 나가기 및 메인 화면 복귀

## 지원 게임

### 요트다이스

주사위를 굴려 족보를 선택하고 점수판을 채우는 경쟁 게임입니다.

- 플레이어별 점수판 표시
- 턴 기반 주사위 굴림
- 주사위 보관 및 보관 해제
- 족보 선택과 점수 반영
- 게임 종료 결과 모달

### 다빈치코드

숫자 타일을 뽑고 상대의 타일 값을 추리하는 경쟁 게임입니다.

- 흰색/검은색 타일 드로우
- 초기 타일 드로우 단계와 일반 드로우 단계
- 플레이어별 타일 핸드 표시
- 숫자 입력 모달을 통한 추리 입력
- 탈락/종료 플레이어 상태 표시

### 더 마인드

말없이 숫자 카드를 오름차순으로 내는 협동 게임입니다.

- 플레이어 수에 따른 레벨과 생명 설정
- 준비 상태 확인 후 레벨 시작
- 개인 카드 표시 및 카드 제출
- 낮은 카드가 남아 있을 때 실패 처리
- 생명, 별, 버린 카드, 낸 카드 상태 표시
- 별 사용 투표
- 레벨 성공, 게임 승리, 게임 패배 상태 처리
- 간단한 이모지 반응

자세한 규칙 기준은 [docs/the-mind-rules.md](docs/the-mind-rules.md)를 참고하세요.

## 사용 흐름

1. 회원가입 또는 로그인합니다.
2. 메인 화면에서 플레이할 게임을 선택합니다.
3. 새 라운지를 만들거나 기존 라운지 코드를 입력해 참가합니다.
4. 라운지에서 참가자를 확인하고 게임을 시작합니다.
5. 게임 화면에서 각 게임 규칙에 맞게 진행합니다.
6. 게임을 나가면 라운지 상태에서도 퇴장 처리됩니다.

## 기술 스택

- React 18
- TypeScript
- React Router
- Chakra UI
- Framer Motion
- React Query
- React DnD
- Firebase Authentication
- Cloud Firestore
- Firebase Realtime Database

## 시작하기

### 요구 사항

- Node.js 18.20.8
- npm
- Firebase 프로젝트

### 설치

```bash
npm install
```

### 환경 변수

프로젝트 루트에 `.env` 파일을 만들고 Firebase 설정 값을 입력합니다.

```env
REACT_APP_FIREBASE_API_KEY=
REACT_APP_FIREBASE_AUTH_DOMAIN=
REACT_APP_FIREBASE_PROJECT_ID=
REACT_APP_FIREBASE_STORAGE_BUCKET=
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=
REACT_APP_FIREBASE_APP_ID=
REACT_APP_FIREBASE_MEASUREMENT_ID=
REACT_APP_FIREBASE_DATABASE_URL=
```

### 개발 서버 실행

```bash
npm start
```

기본 주소는 `http://localhost:3000`입니다.

### 빌드

```bash
npm run build
```

### 테스트

```bash
npm test
```

## Firebase 구성

애플리케이션은 Firebase의 세 가지 기능에 의존합니다.

- Authentication: 로그인, 회원가입, 로그아웃
- Firestore: 사용자 프로필, 게임 목록, 라운지 메타데이터
- Realtime Database: 게임 진행 상태와 실시간 이벤트

보안 규칙과 인덱스 파일은 루트에 포함되어 있습니다.

```text
database.rules.json
firestore.rules
firestore.indexes.json
firebase.json
```

게임 목록은 Firestore의 `Games` 컬렉션에서 가져옵니다. 각 문서는 다음 형태를 기준으로 사용됩니다.

```ts
interface Game {
  id: string;
  name: string;
  description: string;
  image: string;
  metadata?: {
    minPlayers: number;
    maxPlayers: number;
    playMode: '협동게임' | '경쟁게임';
    gameType: '심리게임' | '운빨게임';
    averagePlayTimeMinutes: number;
  };
}
```

현재 라우팅에서 사용하는 게임 이름은 `요트다이스`, `다빈치코드`, `더 마인드`입니다.

## 프로젝트 구조

```text
src/
  app/
    context/       인증과 라운지 전역 컨텍스트
    providers/     Chakra, React Query, DnD 등 전역 Provider
    route/         라우터, 페이지 등록, 경로 정의

  features/
    auth/          로그인, 회원가입, 사용자 API
    game/          게임 목록 모델, API, 카드 UI
    lounge/        라운지 생성/참가/퇴장, 라운지 화면
    main/          메인 화면과 게임 입장 모달
    yacht-dice/    요트다이스 모델, API, 화면, UI
    davinci-code/  다빈치코드 모델, API, 화면, UI
    the-mind/      더 마인드 모델, API, 화면

  models/
    firebase.model.ts
                  Firebase 스냅샷 어댑터

  shared/
    ui/            공통 UI 컴포넌트
    *.ts           공통 유틸, 토스트, 에러, 상수
```

상세한 아키텍처 설명은 [docs/architecture.md](docs/architecture.md)를 참고하세요.

## 라우트

```text
/             /login으로 리다이렉트
/login        로그인
/register     회원가입
/main         게임 목록
/lounge       라운지
/yachtdice    요트다이스
/davincicode  다빈치코드
/themind      더 마인드
```

`/main` 이후의 화면은 인증된 사용자만 접근할 수 있고, 게임 화면은 라운지 컨텍스트가 있어야 정상 동작합니다.

## 개발 규칙

- 기능별 코드는 `src/features/<feature>` 안에서 함께 관리합니다.
- Firebase 접근은 각 feature의 `api` 레이어에 모읍니다.
- 게임 규칙, 점수, 카드, 타일처럼 특정 게임에 종속된 UI는 해당 feature 내부에 둡니다.
- 여러 게임에서 안정적으로 재사용되는 낮은 수준의 컴포넌트만 `shared/ui`로 이동합니다.
- 새로운 게임을 추가할 때는 feature를 만들고 `src/app/route/initPages.ts`, `src/app/route/PageRouter.tsx`에 페이지를 등록합니다.

## 배포

Netlify 배포를 고려한 설정이 포함되어 있으며, `netlify.toml`에서 Node.js 버전을 `18.20.8`로 지정합니다.
