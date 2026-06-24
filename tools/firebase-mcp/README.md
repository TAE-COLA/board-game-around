# Firebase MCP server

Project-scoped MCP server for inspecting this app's Firebase data.

The server uses only Node.js built-ins and Firebase REST APIs. It reads Firebase project settings from
the repository `.env` file unless explicit environment variables are provided.

## Credentials

Create a Firebase service account key in Firebase Console:

1. Project settings
2. Service accounts
3. Generate new private key

Store the JSON outside the repository, for example:

```bash
/private/tmp/board-game-around-firebase-service-account.json
```

Do not commit the JSON file.

## Codex MCP config

Add an MCP server entry like this:

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

Restart Codex after changing MCP config.

## Write access

Writes are disabled by default. To enable Realtime Database write tools, add:

```json
"FIREBASE_MCP_ENABLE_WRITES": "true"
```

Only enable writes when you intentionally want Codex to modify production Firebase data.

## Tools

- `firebase_project_info`: show project, database URL, and write mode.
- `firestore_get_document`: read one Firestore document, such as `Games/the-mind`.
- `firestore_list_collection`: list Firestore documents in a collection, such as `Games`.
- `rtdb_get`: read a Realtime Database path, such as `Lounge`.
- `rtdb_query_equal`: query Realtime Database with `orderBy` and `equalTo`, such as Lounge by code.
- `rtdb_update`: patch a Realtime Database path. Requires write mode.
- `rtdb_set`: replace or delete a Realtime Database path. Requires write mode.

## Local smoke test

```bash
printf '{"jsonrpc":"2.0","id":1,"method":"initialize","params":{}}\n{"jsonrpc":"2.0","id":2,"method":"tools/list","params":{}}\n' \
  | node tools/firebase-mcp/server.mjs
```
