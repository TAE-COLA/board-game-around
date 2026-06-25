# 아키텍처

이 프로젝트는 기능 단위로 코드를 나누는 feature-sliced 구조를 사용합니다. 하나의 feature는 함께 변경되는 UI, 페이지 intent, model, Firebase API를 소유합니다. `shared` 코드는 의도적으로 작게 유지하며, 범용 보드게임 엔진처럼 커지지 않도록 합니다.

## 디렉터리 역할

```text
src/
  app/
    context/       앱 수준 컨텍스트와 라우트 가드
    providers/     Chakra, React Query, DnD 같은 전역 Provider
    route/         라우트 테이블, 페이지 registry, 페이지 bootstrap

  features/
    auth/          로그인/회원가입 페이지, 사용자 model, 사용자 API
    game/          게임 목록 model/API와 게임 카드 UI
    lounge/        라운지 model/API, 로비 페이지, 로비 전용 UI
    main/          메인 페이지와 게임 입장 흐름
    yacht-dice/    요트다이스 API, model, 페이지 intent, 페이지 UI
    davinci-code/  다빈치코드 API, model, 페이지 intent, 페이지 UI
    the-mind/      더 마인드 API, model, 페이지 intent, 페이지 UI

  shared/
    ui/            특정 도메인을 소유하지 않는 작은 UI 키트
    *.ts           공통 유틸, 상수, 에러, 토스트

  models/
    firebase.model.ts
                  feature API에서 사용하는 Firebase 스냅샷 어댑터
```

## 기능 단위 구조

게임 feature는 다음 형태를 따릅니다.

```text
features/<feature>/
  api/       Firebase 읽기/쓰기와 저장소 세부사항
  model/     타입, 상수, 도메인 데이터 구조
  page/      라우트 페이지, reducer/intent 타입, 페이지 hook
  ui/        해당 feature의 상태나 규칙을 아는 컴포넌트
  index.ts   다른 slice에 공개하는 public API
```

모든 feature가 모든 폴더를 가져야 하는 것은 아닙니다. 예를 들어 `main`에는 Firebase API가 없고, `the-mind`는 현재 별도의 `ui` 폴더가 없습니다.

## 의존성 규칙

허용:

- `app`은 feature 공개 API와 `shared`에 의존할 수 있습니다.
- feature는 실제 제품 의존성을 표현할 때 다른 feature의 공개 API에 의존할 수 있습니다.
- feature 내부 파일끼리는 같은 slice 안에서 로컬 상대 import를 우선 사용합니다.
- `shared/ui`는 Chakra, React, Framer Motion 같은 범용 라이브러리에 의존할 수 있습니다.
- feature API는 Firebase 스냅샷 어댑터로 `models/FModel`을 사용할 수 있습니다.

피할 것:

- `shared/ui`가 `features`를 import하는 것
- 게임 전용 컴포넌트를 `shared/ui`에 두는 것
- 의도적인 이유 없이 다른 feature의 내부 폴더를 직접 import하는 것
- 여러 게임에서 같은 동작이 실제로 필요하다는 근거가 생기기 전에 범용 dice/card/chip 컴포넌트를 새로 만드는 것

## UI 소유권

`shared/ui`는 여러 게임에서 안정적으로 동일하게 쓰이는 컴포넌트에만 사용합니다.

- `Page`, `Header`, `Loading` 같은 레이아웃 wrapper
- 기본 input과 divider
- 낮은 수준의 animation wrapper
- 낮은 수준의 drag, dice primitive
- 숫자 선택 모달 같은 범용 modal

다음 정보를 아는 UI는 feature 내부에 둡니다.

- 게임 규칙
- 턴 상태
- 플레이어/로비 소유권
- Firebase/domain model 구조
- 점수, 순위, 손패, 타일, 칩, 카드 동작

이 기준을 지키면 shared UI가 가볍게 유지되고, 공통 컴포넌트에 게임별 옵션이 누적되는 것을 막을 수 있습니다.

## Firebase/API 책임

Firebase 접근은 feature API가 캡슐화합니다.

- `features/auth/api`는 사용자 인증과 프로필 접근을 소유합니다.
- `features/game/api`는 게임 목록을 소유합니다.
- `features/lounge/api`는 라운지 멤버십과 상태를 소유합니다.
- 각 게임 feature는 자기 게임 세션 API를 소유합니다.

페이지, hook, UI는 Firebase를 직접 import하지 않고 feature API를 호출해야 합니다.

## 새 게임 추가

1. `src/features/<game-name>/`를 만듭니다.
2. 필요에 따라 `api/`, `model/`, `page/`, `ui/` 폴더를 추가합니다.
3. `features/<game-name>/index.ts`에서 페이지와 API를 export합니다.
4. `src/app/route/initPages.ts`에 라우트 페이지를 등록합니다.
5. `src/app/route/PageRouter.tsx`에 라우트 path를 추가합니다.
6. 게임 전용 말, 카드, 칩, 점수, 컨트롤은 해당 게임 slice 안에 둡니다.
7. 다른 게임에서도 같은 동작이 게임 전용 prop 없이 필요해진 뒤에만 UI를 `shared/ui`로 승격합니다.

## 현재 경계 메모

- `src/models`에는 의도적으로 Firebase 스냅샷 어댑터만 둡니다.
- `features/davinci-code`는 model과 component가 모두 `DavinciCodeTile` 이름을 공유하므로 feature root에서 전체 `ui` 폴더를 export하지 않습니다.
- `features/lounge`는 런타임에 여러 게임이 공유하므로, 게임 페이지는 공통 플레이어/라운지 데이터가 필요할 때 lounge의 공개 UI/API에 의존할 수 있습니다.
