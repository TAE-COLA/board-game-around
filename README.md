# board-game-around

### 디렉토리 및 모듈 구조 (Clean Architecture)

```scss
UI 레이어 (가장 바깥, 변경이 잦음)
│
├── pages
│    │ (화면 페이지 컴포넌트, route)
│    │ widgets에 의존 (재사용 가능한 UI 조각 사용)
│    ↓
├── widgets
│    │ (UI 조각 컴포넌트, 디자인 시스템 컴포넌트)
│    │ app에 의존 (Provider, Router 등)
│    ↓
애플리케이션 레이어 (비즈니스 로직, 상태 관리)
│
├── app
│    │ (Router, Provider 등 애플리케이션 설정)
│    │ features에 의존 (기능 비즈니스 로직 호출)
│    ↓
├── features
│    │ (비즈니스 로직, 액션 처리)
│    │ models, shared에 의존 (도메인 모델 호출, 공통 유틸)
│    ↓
도메인 레이어 (핵심 비즈니스 엔티티, 순수 데이터 구조)
│
├── models
│    │ (도메인 데이터 모델, 인터페이스)
│    │ shared에만 의존 가능 (utils 등)
│
│ (models은 절대로 features, app, widgets, pages를 참조하면 안 됨)
│
공통 레이어 (가장 안정적, 변경이 거의 없음)
│
└── shared, assets
    │ (유틸, 헬퍼, 공통 기능, 정적 리소스)
    │ 다른 최상단 모듈에 절대로 의존하지 않아야 함.
```
