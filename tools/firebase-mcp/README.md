# Firebase MCP 서버

이 앱의 Firebase 데이터를 점검하기 위한 프로젝트 범위 MCP 서버입니다.

이 서버는 Node.js 내장 기능과 Firebase REST API만 사용합니다. 명시적인 환경 변수가 제공되지 않으면 저장소의 `.env` 파일에서 Firebase 프로젝트 설정을 읽습니다.

## 인증 정보

Firebase Console에서 Firebase 서비스 계정 키를 만듭니다.

1. 프로젝트 설정
2. 서비스 계정
3. 새 비공개 키 생성

JSON 파일은 저장소 밖에 보관합니다. 예:

```bash
/private/tmp/board-game-around-firebase-service-account.json
```

JSON 파일은 커밋하지 마세요.

## Codex MCP 설정

다음과 같은 MCP 서버 항목을 추가합니다.

```json
{
  "mcpServers": {
    "board-game-around-firebase": {
      "command": "node",
      "args": [
        "/Users/taewoo/Development/board-game-around/tools/firebase-mcp/server.mjs"
      ],
      "cwd": "/Users/taewoo/Development/board-game-around",
      "env": {
        "GOOGLE_APPLICATION_CREDENTIALS": "/private/tmp/board-game-around-firebase-service-account.json"
      }
    }
  }
}
```

MCP 설정을 변경한 뒤 Codex를 다시 시작합니다.

## 쓰기 권한

기본적으로 쓰기 작업은 비활성화되어 있습니다. Realtime Database 쓰기 도구를 활성화하려면 다음 값을 추가합니다.

```json
"FIREBASE_MCP_ENABLE_WRITES": "true"
```

Codex가 프로덕션 Firebase 데이터를 수정하길 의도한 경우에만 쓰기를 활성화하세요.

## 도구

- `firebase_project_info`: 프로젝트, database URL, 쓰기 모드를 표시합니다.
- `firestore_get_document`: `Games/the-mind` 같은 Firestore 문서 하나를 읽습니다.
- `firestore_list_collection`: `Games` 같은 컬렉션의 Firestore 문서를 나열합니다.
- `rtdb_get`: `Lounge` 같은 Realtime Database 경로를 읽습니다.
- `rtdb_query_equal`: 라운지 코드를 조회하는 것처럼 `orderBy`와 `equalTo`로 Realtime Database를 조회합니다.
- `rtdb_update`: Realtime Database 경로를 patch합니다. 쓰기 모드가 필요합니다.
- `rtdb_set`: Realtime Database 경로를 교체하거나 삭제합니다. 쓰기 모드가 필요합니다.

## 로컬 스모크 테스트

```bash
printf '{"jsonrpc":"2.0","id":1,"method":"initialize","params":{}}\n{"jsonrpc":"2.0","id":2,"method":"tools/list","params":{}}\n' \
  | node tools/firebase-mcp/server.mjs
```
